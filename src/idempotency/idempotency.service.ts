import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, ProjectionType, QueryOptions } from 'mongoose';
import { IdempotencyFindQueryData } from './idempotency.interface';
import { Idempotency, IdempotencyDocument } from './idempotency.schema';
import { CreateIdempotencyDto } from './dtos/create-idempotency.dto';
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
}
