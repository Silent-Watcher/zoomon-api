import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../user/user.schema';
import slugify from 'slugify';

@Schema({
	id: true,
	timestamps: true,
})
export class Article {
	declare id: string;

	@Prop({
		required: true,
		unique: true,
		index: true,
		trim: true,
		minlength: 5,
		maxLength: 50,
	})
	declare title: string;

	@Prop({ required: false, trim: true, minlength: 5, maxLength: 50 })
	subTitle?: string;

	@Prop({
		required: true,
		default(this: ArticlaDocument) {
			return this.title ? slugify(this.title) : slugify(this.id);
		},
		trim: true,
		index: true,
		unique: true,
	})
	declare slug: string;

	@Prop({
		type: [Types.ObjectId],
		required: true,
		ref: User.name,
		index: true,
	})
	declare authorId: Types.ObjectId;

	@Prop({ required: true, default: 0, min: 0 })
	declare timeToRead: number; // in minute

	@Prop({ required: true, minLength: 10, maxLength: 100_000 })
	declare content: string;

	@Prop({ required: false, default: 0, min: 0 })
	declare likesCount: number;

	@Prop({ required: false, default: 0, min: 0 })
	declare commentsCount: number;

	@Prop({ required: false, default: 0, min: 0 })
	declare version: number;

	declare createdAt: Date;
	declare updatedAt: Date;
}

export type ArticlaDocument = HydratedDocument<Article>;
export const ArticleSchema = SchemaFactory.createForClass(Article);
