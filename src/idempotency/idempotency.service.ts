import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, ProjectionType, QueryOptions } from 'mongoose';
import {
	IdempotencyFindQueryData,
	IdempotencyResolveStatusData,
	ResolveStatusResult,
} from './idempotency.interface';
import { Idempotency, IdempotencyDocument } from './idempotency.schema';
import { CreateIdempotencyDto } from './dtos/create-idempotency.dto';
import {
	IDEMPOTENCY_RESOLUTION_TYPE,
	IDEMPOTENCY_STATUS,
} from './idempotency.constant';
@Injectable()
export class IdempotencyService {
	constructor(
		@InjectModel(Idempotency.name)
		private readonly idempotencyKeyModel: Model<Idempotency>,
	) {}

	async findOne(
		findData: IdempotencyFindQueryData,
		projection?: ProjectionType<Idempotency>,
		options?: QueryOptions,
	): Promise<Idempotency | IdempotencyDocument | null> {
		const { key, operationName, userId, targetResourceId } = findData;
		let query: IdempotencyFindQueryData = { key, operationName, userId };
		if (targetResourceId) query.targetResourceId = targetResourceId;

		return this.idempotencyKeyModel.findOne(
			query,
			projection ?? { __v: 0 },
			options ?? { lean: true },
		);
	}

	create(
		userId: string,
		createDto: CreateIdempotencyDto,
		session?: ClientSession,
	) {
		const idempotency = new this.idempotencyKeyModel({
			userId,
			...createDto,
		});

		return idempotency.save({ session });
	}

	async process<T>(
		statusData: IdempotencyResolveStatusData,
		fingerPrint: string,
		queryOptions?: {
			options?: Omit<QueryOptions, 'lean'>;
			projection?: ProjectionType<Idempotency>;
		},
	): Promise<ResolveStatusResult<T>> {
		const { key, operationName, targetResourceId, userId } = statusData;
		const { options, projection } = queryOptions ?? {};

		let idempotency = (await this.findOne(
			{
				operationName,
				key,
				userId,
				targetResourceId,
			},
			projection ?? { __v: 0 },
			{ lean: false, ...options },
		)) as IdempotencyDocument;

		if (!idempotency) return { type: IDEMPOTENCY_RESOLUTION_TYPE.EXECUTE };

		this.validateFingerPrint(idempotency, fingerPrint);
		return this.resolveStatus(idempotency, true);
	}

	private validateFingerPrint(
		idempotencyDoc: IdempotencyDocument,
		fingerPrint: string,
	): void {
		if (idempotencyDoc.requestFingerPrint !== fingerPrint) {
			throw new UnprocessableEntityException(
				'same key used with different payload',
			);
		}
	}

	private async resolveStatus<T>(
		idempotency: IdempotencyDocument,
		allowRetryOnFailed: boolean,
	): Promise<ResolveStatusResult<T>> {
		switch (idempotency.status) {
			case IDEMPOTENCY_STATUS.COMPLETED:
				return this.createReplayResult(idempotency);

			case IDEMPOTENCY_STATUS.IN_PROGRESS:
				throw new ConflictException(
					'Idempotent request already in progress.',
				);

			case IDEMPOTENCY_STATUS.FAILED:
				return this.handleFailedStatus(idempotency, allowRetryOnFailed);

			default:
				throw new InternalServerErrorException(
					'Unknown Idempotency Status',
				);
		}
	}

	private createReplayResult<T>(
		idempotency: IdempotencyDocument,
	): ResolveStatusResult<T> {
		return {
			type: IDEMPOTENCY_RESOLUTION_TYPE.REPLAY,
			responseBody: JSON.parse(idempotency.responseBody!) as T,
			responseCode: idempotency?.responseCode!,
		};
	}

	private async handleFailedStatus<T>(
		idempotency: IdempotencyDocument,
		allowRetryOnFailed: boolean,
	): Promise<ResolveStatusResult<T>> {
		if (allowRetryOnFailed) {
			await idempotency.updateOne({
				$set: { status: IDEMPOTENCY_STATUS.IN_PROGRESS },
			});

			return {
				type: IDEMPOTENCY_RESOLUTION_TYPE.EXECUTE,
				idempotency,
			};
		}

		return this.createReplayResult(idempotency);
	}
}
