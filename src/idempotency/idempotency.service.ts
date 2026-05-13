import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
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

	async process(
		statusData: IdempotencyResolveStatusData,
		fingerPrint: string,
		queryOptions: {
			options?: Omit<QueryOptions, 'lean'>;
			projection?: ProjectionType<Idempotency>;
		},
	): Promise<ResolveStatusResult> {
		const { key, operationName, targetResourceId, userId } = statusData;
		const { options, projection } = queryOptions;

		let idempotency = (await this.findOne(
			{
				operationName,
				key,
				userId,
				targetResourceId,
			},
			projection,
			{ lean: false, ...options },
		)) as IdempotencyDocument;

		if (!idempotency) return { type: IDEMPOTENCY_RESOLUTION_TYPE.EXECUTE };

		await this.validateFingerPrint(idempotency, fingerPrint);
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

	private async resolveStatus(
		idempotency: IdempotencyDocument,
		allowRetryOnFailed: boolean,
	): Promise<ResolveStatusResult> {
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

	private createReplayResult(
		idempotency: IdempotencyDocument,
	): ResolveStatusResult {
		return {
			type: IDEMPOTENCY_RESOLUTION_TYPE.REPLAY,
			responseBody: idempotency.responseBody,
			responseCode: idempotency.responseCode,
		};
	}

	private async handleFailedStatus(
		idempotency: IdempotencyDocument,
		allowRetryOnFailed: boolean,
	): Promise<ResolveStatusResult> {
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
