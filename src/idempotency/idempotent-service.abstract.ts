import Redis from 'ioredis';
import { AppLogger } from '../logger/logger.service';
import {
	IDEMPOTENCY_OPERATION,
	IDEMPOTENCY_RESOLUTION_TYPE,
	IDEMPOTENCY_STATUS,
} from './idempotency.constant';
import { IdempotencyRequestData } from './idempotency.interface';
import { IdempotencyService } from './idempotency.service';
import { ClientSession } from 'mongoose';

export abstract class IdempotentService {
	constructor(
		protected readonly idempotencyService: IdempotencyService,
		protected readonly redis: Redis,
		protected readonly logger: AppLogger,
	) {}

	protected async executeIdempotent<T>(
		operationName: IDEMPOTENCY_OPERATION,
		idempotencyData: IdempotencyRequestData,
		userId: string,
		targetResourceId: string,
		businessLogic: () => Promise<{ code: number; body: T }>,
		options?: { session?: ClientSession },
	): Promise<{ responseCode: number; responseBody: T }> {
		const { key, lockToken, requestFingerPrint } = idempotencyData;
		const { session } = options ?? {};

		const processResult = await this.idempotencyService.process<T>(
			{ key, operationName, userId },
			requestFingerPrint,
		);

		if (processResult.type == IDEMPOTENCY_RESOLUTION_TYPE.REPLAY) {
			const deletedCount = await this.redis.del(lockToken);
			if (!deletedCount) {
				this.logger.warn('failed to delete the idempotency lock token');
			}

			const { responseBody, responseCode } = processResult;
			return { responseBody, responseCode };
		}

		let idempotency =
			processResult.idempotency ??
			(await this.idempotencyService.create(
				userId,
				{
					key,
					operationName,
					requestFingerPrint,
					targetResourceId,
					status: IDEMPOTENCY_STATUS.IN_PROGRESS,
				},
				session,
			));

		try {
			const { body, code } = await businessLogic();

			await idempotency.updateOne(
				{
					status: IDEMPOTENCY_STATUS.COMPLETED,
					responseCode: code,
					responseBody: JSON.stringify(body),
				},
				{ session },
			);

			await session?.commitTransaction();

			return { responseBody: body, responseCode: code };
		} catch (err) {
			await idempotency.updateOne(
				{ status: IDEMPOTENCY_STATUS.FAILED },
				{ session },
			);
			await session?.abortTransaction();
			throw err;
		} finally {
			const deletedCount = await this.redis.del(lockToken);
			if (!deletedCount) {
				this.logger.warn('failed to delete the idempotency lock token');
			}
			await session?.endSession();
		}
	}
}
