import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Like } from './like.schema';
import { Connection, Model } from 'mongoose';
import { Article, ArticleDocument } from '../article/article.schema';
import { LikeResult } from './like.interface';
import { CommentDocument } from '../comment/comment.schema';
import { Comment } from '../comment/comment.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_NAMES } from '../event/event.constant';
import { CommentLikedEvent } from '../common/events/comment-liked.event';

@Injectable()
export class LikeService {
	constructor(
		@InjectModel(Like.name) private readonly likeModel: Model<Like>,
		@InjectConnection() private readonly connection: Connection,
		private eventEmitter: EventEmitter2,
	) {}

	async SubmitOrRetriveLikeForArticle(
		userId: string,
		article: ArticleDocument,
	): Promise<LikeResult> {
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
			articleId: article.id,
			liked: false,
			likedBefore: false,
		};

		if (foundedLike) {
			await article.updateOne({ $inc: { likesCount: -1 } }, { session });
			await foundedLike.deleteOne({ lean: true, session });

			Object.assign<
				LikeResult,
				Pick<LikeResult, 'liked' | 'likedBefore'>
			>(result, { liked: false, likedBefore: true });
		} else {
			const newLike = new this.likeModel({
				entityId: article.id,
				owner: userId,
				entityType: Article.name,
			});

			await newLike.save({ session });

			await article.updateOne({ $inc: { likesCount: 1 } }, { session });

			Object.assign<
				LikeResult,
				Pick<LikeResult, 'liked' | 'likedBefore'>
			>(result, { liked: true, likedBefore: false });
		}

		await session.commitTransaction();
		await session.endSession();

		return result;
	}

	async SubmitOrRetriveLikeForComment(
		userId: string,
		comment: CommentDocument,
	) {
		const foundedLike = await this.likeModel.findOne(
			{
				owner: userId,
				entityType: Comment.name,
			},
			{ _id: 1 },
			{ lean: false },
		);

		const session = await this.connection.startSession();
		session.startTransaction();

		const result: LikeResult = {
			by: userId,
			articleId: comment.id,
			liked: false,
			likedBefore: false,
		};

		if (foundedLike) {
			await comment.updateOne({ $inc: { likesCount: -1 } }, { session });
			await foundedLike.deleteOne({ lean: true, session });

			Object.assign<
				LikeResult,
				Pick<LikeResult, 'liked' | 'likedBefore'>
			>(result, { liked: false, likedBefore: true });
		} else {
			const newLike = new this.likeModel({
				entityId: comment.id,
				owner: userId,
				entityType: Comment.name,
			});

			await newLike.save({ session });

			await comment.updateOne({ $inc: { likesCount: 1 } }, { session });

			Object.assign<
				LikeResult,
				Pick<LikeResult, 'liked' | 'likedBefore'>
			>(result, { liked: true, likedBefore: false });

			this.eventEmitter.emit(
				EVENT_NAMES.COMMENT_LIKED,
				new CommentLikedEvent({
					commentId: comment.id,
					commentOwner: comment.owner.toHexString(),
					commentContent: comment.content,
					entityId: comment?.entityId?._id.toHexString(),
					entityType: comment?.entityType,
					entityContent: comment?.entityId['content'],
				}),
			);
		}

		await session.commitTransaction();
		await session.endSession();

		return result;
	}
}
