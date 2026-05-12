import { HttpStatus } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IDEMPOTENCY_KEY_STATUS } from './idempotency.constant';
import { User } from '../user/decorators/user.decorator';

@Schema({
	id: true,
	timestamps: true,
})
export class IdempotencyKey {
	@Prop({ required: true })
	declare key: string;

	@Prop({ required: true, ref: User.name })
	declare userId: Types.ObjectId;

	@Prop({ required: true })
	declare requestFingerPrint: string;

	@Prop({ required: true, enum: HttpStatus, default: HttpStatus.OK })
	declare responseCode: HttpStatus;

	@Prop({ required: true, trim: true })
	declare responseBody: string;

	@Prop({
		required: true,
		enum: IDEMPOTENCY_KEY_STATUS,
		default: IDEMPOTENCY_KEY_STATUS.IN_PROGRESS,
	})
	declare status: IDEMPOTENCY_KEY_STATUS;

	@Prop({ required: true })
	declare operationName: string;

	@Prop({ required: false })
	targetResourceId?: Types.ObjectId;

	@Prop({ required: true, default: 0, min: 0 })
	declare attemptCount: number;

	@Prop({
		required: function (this: IdempotencyKeyDocument) {
			return this.status === IDEMPOTENCY_KEY_STATUS.FAILED;
		},
	})
	errorType?: string;

	@Prop({ type: Types.Map, of: String, required: false })
	HeadersToReplay?: Record<string, any>;

	@Prop({ required: true })
	declare expiresAt: Date;

	declare createdAt: Date;
	declare updatedAt: Date;
}

export type IdempotencyKeyDocument = HydratedDocument<IdempotencyKey>;
export const IdempotencyKeySchema =
	SchemaFactory.createForClass(IdempotencyKey);

IdempotencyKeySchema.index(
	{
		key: 1,
		operationName: 1,
		targetResourceId: 1,
		userId: 1,
	},
	{ unique: true },
);
