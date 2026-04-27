import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { LIKEABLE_ENTITIES } from './like.constant';
import { User } from '../user/decorators/user.decorator';

@Schema({
	id: true,
	timestamps: {
		createdAt: true,
	},
	toJSON: { virtuals: true },
})
export class Like {
	@Prop({ type: Types.ObjectId, required: true })
	declare entityId: mongoose.Types.ObjectId;

	@Prop({ enum: LIKEABLE_ENTITIES, required: true })
	declare entityType: string;

	@Prop({ type: Types.ObjectId, required: true, ref: User.name, index: true })
	declare owner: mongoose.Types.ObjectId;

	declare createdAt: Date;
}

export type LikeDocument = HydratedDocument<Like>;
export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.index({ entityType: 1, owner: 1 });
