import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IdempotencyKey } from './idempotency-key.schema';
import { Model } from 'mongoose';

@Injectable()
export class IdempotencyService {
	constructor(
		@InjectModel(IdempotencyKey.name)
		private readonly idempotencyKeyModel: Model<IdempotencyKey>,
	) {}
}
