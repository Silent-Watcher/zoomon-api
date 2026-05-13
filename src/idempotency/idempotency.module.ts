import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Idempotency, IdempotencySchema } from './idempotency.schema';
import { IdempotencyService } from './idempotency.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Idempotency.name, schema: IdempotencySchema },
		]),
	],
	providers: [IdempotencyService],
	exports: [IdempotencyService],
})
export class IdempotencyModule {}
