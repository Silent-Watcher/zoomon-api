import { HttpStatus } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IDEMPOTENCY_STATUS } from './idempotency.constant';
import { User } from '../user/decorators/user.decorator';
import { Next24Hours } from '../common/constants/date.constant';

@Schema({
	id: true,
	timestamps: true,
})
export class Idempotency {
	@Prop({ required: true })
	declare key: string;

	@Prop({ required: true, ref: User.name })
	declare userId: Types.ObjectId;

	@Prop({ required: true })
	declare requestFingerPrint: string;

	@Prop({
		required: function (this: IdempotencyDocument) {
			return this.status !== IDEMPOTENCY_STATUS.IN_PROGRESS;
		},
		enum: HttpStatus,
		default: undefined,
	})
	responseCode?: HttpStatus;

	@Prop({
		required: function (this: IdempotencyDocument) {
			return this.status !== IDEMPOTENCY_STATUS.IN_PROGRESS;
		},
		trim: true,
		default: undefined,
	})
	responseBody?: string;

	@Prop({
		required: true,
		enum: IDEMPOTENCY_STATUS,
		default: IDEMPOTENCY_STATUS.IN_PROGRESS,
	})
	declare status: IDEMPOTENCY_STATUS;

	@Prop({ required: true })
	declare operationName: string;

	@Prop({ required: false })
	targetResourceId?: Types.ObjectId;

	@Prop({ required: true, default: 0, min: 0 })
	declare attemptCount: number;

	@Prop({
		required: function (this: IdempotencyDocument) {
			return this.status === IDEMPOTENCY_STATUS.FAILED;
		},
	})
	errorType?: string;

	@Prop({ type: Types.Map, of: String, required: false })
	HeadersToReplay?: Record<string, any>;

	@Prop({ required: true, default: Next24Hours })
	declare expiresAt: Date;

	declare createdAt: Date;
	declare updatedAt: Date;
}

export type IdempotencyDocument = HydratedDocument<Idempotency>;
export const IdempotencySchema = SchemaFactory.createForClass(Idempotency);

IdempotencySchema.index(
	{
		key: 1,
		operationName: 1,
		targetResourceId: 1,
		userId: 1,
	},
	{ unique: true },
);
