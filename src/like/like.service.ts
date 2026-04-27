import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Like } from './like.schema';
import { Connection, Model } from 'mongoose';
import { Article } from '../article/article.schema';
import { ArticleService } from '../article/article.service';
import { LikeResult } from './like.interface';

@Injectable()
export class LikeService {
	constructor(
		@InjectModel(Like.name) private readonly likeModel: Model<Like>,
		@InjectConnection() private readonly connection: Connection,
		private readonly articleService: ArticleService,
	) {}

	async SubmitOrRetriveLikeForArticle(
		userId: string,
		articleId: string,
	): Promise<LikeResult> {
		const foundedArticle = await this.articleService.findById(
			articleId,
			{ likesCount: 1, _id: 1 },
			{ lean: false },
		);

		if (!foundedArticle)
			throw new NotFoundException(`${Article.name} not found`);

		const foundedLike = await this.likeModel.findOne(
			{
				owner: userId,
				entityType: Article.name,
			},
			{ _id: 1 },
			{ lean: false },
		);

		const session = await this.connection.startSession();
		session.startTransaction();

		const result: LikeResult = {
			by: userId,
			articleId: articleId,
			liked: false,
			likedBefore: false,
		};

		if (foundedLike) {
			await foundedArticle.updateOne(
				{ $inc: { likesCount: -1 } },
				{ session },
			);
			await foundedLike.deleteOne({ lean: true, session });

			Object.assign<
				LikeResult,
				Pick<LikeResult, 'liked' | 'likedBefore'>
			>(result, { liked: false, likedBefore: true });
		} else {
			const newLike = new this.likeModel({
				entityId: articleId,
				owner: userId,
				entityType: Article.name,
			});

			await newLike.save({ session });
			await foundedArticle.updateOne(
				{ $set: { likesCount: 1 } },
				{ session },
			);

			Object.assign<
				LikeResult,
				Pick<LikeResult, 'liked' | 'likedBefore'>
			>(result, { liked: true, likedBefore: false });
		}

		return result;
	}
}
