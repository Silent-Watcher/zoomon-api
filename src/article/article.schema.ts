import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../user/user.schema';
import slugify from 'slugify';
import { Category } from '../category/category.schema';

@Schema({
	id: true,
	timestamps: true,
	toJSON: { virtuals: true },
})
export class Article {
	declare id: string;
	declare _id: string;

	@Prop({
		required: true,
		unique: true,
		trim: true,
		minlength: 5,
		maxLength: 50,
	})
	declare title: string;

	@Prop({ required: false, trim: true, minlength: 5, maxLength: 50 })
	subTitle?: string;

	@Prop({
		required: true,
		default(this: ArticleDocument) {
			return this.title
				? slugify(this.title, { lower: true, strict: true })
				: slugify(this.id);
		},
		trim: true,
		unique: true,
	})
	declare slug: string;

	@Prop({
		type: [Types.ObjectId],
		required: true,
		ref: User.name,
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

	@Prop({ type: [Types.ObjectId], required: true, ref: Category.name })
	declare categories: Types.ObjectId[];

	@Prop({ required: true, default: false })
	declare isPublished: boolean;

	@Prop({ required: true, default: false })
	declare isPremium: boolean;

	@Prop({ required: false, default: undefined, sparse: true })
	deletedAt?: Date;

	declare createdAt: Date;
	declare updatedAt: Date;
}

export type ArticleDocument = HydratedDocument<Article>;
export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.index({ isPublished: 1, deletedAt: 1, createdAt: -1, _id: 1 });
ArticleSchema.index({ isPublished: 1, deletedAt: 1, likesCount: -1, _id: 1 });
ArticleSchema.index({
	isPublished: 1,
	deletedAt: 1,
	commentsCount: -1,
	_id: 1,
});

// Premium filtering
ArticleSchema.index({
	isPremium: 1,
	isPublished: 1,
	deletedAt: 1,
	createdAt: -1,
	_id: 1,
});
ArticleSchema.index({
	isPremium: 1,
	isPublished: 1,
	deletedAt: 1,
	likesCount: -1,
	_id: 1,
});

// Author-specific queries
ArticleSchema.index({
	authorId: 1,
	isPublished: 1,
	deletedAt: 1,
	createdAt: -1,
	_id: 1,
});
ArticleSchema.index({
	authorId: 1,
	isPremium: 1,
	isPublished: 1,
	deletedAt: 1,
	createdAt: -1,
	_id: 1,
});

// Category-specific queries
ArticleSchema.index({
	categories: 1,
	isPublished: 1,
	deletedAt: 1,
	createdAt: -1,
	_id: 1,
});
ArticleSchema.index({
	categories: 1,
	isPublished: 1,
	deletedAt: 1,
	likesCount: -1,
	_id: 1,
});
ArticleSchema.index({
	categories: 1,
	isPremium: 1,
	isPublished: 1,
	deletedAt: 1,
	createdAt: -1,
	_id: 1,
});
