import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../user/decorators/user.decorator';
import {
	COMMENT_STATUS,
	COMMENT_STATUS_LIST,
	MAXIMUM_COMMENT_CONTENT_LENGTH,
	MAXIMUM_COMMENTS_DEPTH,
	MINIMUM_COMMENT_CONTENT_LENGTH,
} from './comment.constant';
import { Article } from '../article/article.schema';

@Schema({
	id: true,
	toJSON: { virtuals: true },
	timestamps: true,
})
export class Comment {
	declare _id: string;
	declare id: string;

	@Prop({ type: Types.ObjectId, required: true, index: true, ref: User.name })
	declare owner: Types.ObjectId;

	@Prop({
		required: true,
		minLength: MINIMUM_COMMENT_CONTENT_LENGTH,
		maxLength: MAXIMUM_COMMENT_CONTENT_LENGTH,
		trim: true,
	})
	declare content: string;

	@Prop({ type: Types.ObjectId, required: true, index: true })
	declare entityId: Types.ObjectId;

	@Prop({ enum: [Article.name, Comment.name], required: true, index: true })
	declare entityType: string;

	@Prop({
		type: Types.ObjectId,
		required: false,
		default: undefined,
		ref: Comment.name,
		index: true,
		sparse: true,
	})
	parentId?: Types.ObjectId;

	@Prop({
		type: Types.ObjectId,
		required: true,
		default: function (this: CommentDocument) {
			return this._id;
		},
		ref: Comment.name,
		index: true,
	})
	declare rootId: Types.ObjectId;

	@Prop({ required: true, min: 0, max: MAXIMUM_COMMENTS_DEPTH, default: 0 })
	declare depth: number;

	@Prop({ required: false, default: undefined })
	editedAt?: Date;

	@Prop({ required: false, default: undefined, index: true })
	deletedAt?: Date;

	@Prop({ required: true, default: 0 })
	declare likesCount: number;

	@Prop({ required: true, default: 0 })
	declare repliesCount: number;

	@Prop({
		required: true,
		default: function (this: CommentDocument) {
			return `${this._id.toString()}`;
		},
	})
	declare path: string;

	@Prop({
		required: true,
		enum: COMMENT_STATUS_LIST,
		default: COMMENT_STATUS.PENDING,
		index: true,
	})
	declare status: string;

	@Prop({ required: false, default: 0, min: 0 })
	declare version: number;

	declare updatedAt: Date;
	declare createdAt: Date;
}

export type CommentDocument = HydratedDocument<Comment>;
export const CommentSchema = SchemaFactory.createForClass(Comment);
