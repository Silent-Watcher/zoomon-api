import {
	ConflictException,
	Injectable,
	UnprocessableEntityException,
} from '@nestjs/common';
import { IdempotencyRequestData } from './idempotency/idempotency.interface';
import { IdempotencyService } from './idempotency/idempotency.service';
import { IDEMPOTENCY_STATUS } from './idempotency/idempotency.constant';
import { IdempotencyDocument } from './idempotency/idempotency.schema';
import { Types } from 'mongoose';

@Injectable()
export class AppService {
	constructor(private readonly idempotencyService: IdempotencyService) {}

	async handleTest(
		userId: string,
		entityId: string,
		idempotencyData: IdempotencyRequestData,
	) {
		const operationName = 'handleTest';
		const { key, lockToken, requestFingerPrint } = idempotencyData;

		// let idempotency = await this.idempotencyService.findOne(
		// 	{
		// 		operationName,
		// 		key,
		// 		userId,
		// 		targetResourceId: entityId,
		// 	},
		// 	{},
		// 	{ lean: false },
		// );

		if (idempotency) {
			if (idempotency.requestFingerPrint !== requestFingerPrint) {
				throw new UnprocessableEntityException(
					'same key used with different payload',
				);
			}

			if (idempotency.status == IDEMPOTENCY_STATUS.COMPLETED) {
				return {
					responseBody: idempotency.responseBody,
					responseCode: idempotency.responseCode,
				};
			}

			if (idempotency.status == IDEMPOTENCY_STATUS.IN_PROGRESS) {
				throw new ConflictException(
					'Idempotent request already in progress.',
				);
			}

			if (idempotency.status == IDEMPOTENCY_STATUS.FAILED) {
				await (idempotency as IdempotencyDocument).updateOne({
					$set: { status: IDEMPOTENCY_STATUS.IN_PROGRESS },
				});
			}
		} else {
			idempotency = await this.idempotencyService.create(userId, {
				key,
				operationName,
				requestFingerPrint,
				targetResourceId: new Types.ObjectId().toHexString(),
				status: IDEMPOTENCY_STATUS.IN_PROGRESS,
			});
		}

		// do your logic

		// update idempotency status
		// free lock
		// return response
	}
}
