import { Module } from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';
import { MongooseModule } from '@nestjs/mongoose';
import { IdempotencyKey, IdempotencyKeySchema } from './idempotency-key.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: IdempotencyKey.name, schema: IdempotencyKeySchema },
		]),
	],
	providers: [IdempotencyService],
})
export class IdempotencyModule {}
