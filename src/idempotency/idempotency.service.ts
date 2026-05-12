import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IdempotencyKey } from './idempotency-key.schema';
import { Model, ProjectionType, QueryOptions } from 'mongoose';
import { IdempotencyFindQueryData } from './idempotency.interface';
@Injectable()
export class IdempotencyService {
	constructor(
		@InjectModel(IdempotencyKey.name)
		private readonly idempotencyKeyModel: Model<IdempotencyKey>,
	) {}

	async findOne(
		findData: IdempotencyFindQueryData,
		projection?: ProjectionType<IdempotencyKey>,
		options?: QueryOptions,
	): Promise<IdempotencyKey | null> {
		const { key, operationName, userId, targetResourceId } = findData;
		let query: IdempotencyFindQueryData = { key, operationName, userId };
		if (targetResourceId) query.targetResourceId = targetResourceId;

		return this.idempotencyKeyModel.findOne(
			query,
			projection ?? { __v: 0 },
			options ?? { lean: true },
		);
	}
}
