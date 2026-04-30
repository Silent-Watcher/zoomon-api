import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, QueryFilter, SortOrder } from 'mongoose';
import { Comment, CommentDocument } from './comment.schema';
import { UserDocument } from '../user/user.schema';
import { CreateATopLevelCommentDto } from './dtos/create-a-top-level-comment.dto';
import { Article, ArticleDocument } from '../article/article.schema';
import { ArticleService } from '../article/article.service';
import { CreateReplyCommentDto } from './dtos/create-reply-comment.dto';
import { COMMENT_STATUS, MAXIMUM_COMMENTS_DEPTH } from './comment.constant';
import { ListCommentsOpts } from './comment.interface';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel(Comment.name)
		private readonly commentsModel: Model<Comment>,
		@InjectConnection() private readonly connection: Connection,
		private readonly articleService: ArticleService,
	) {}

	async createATopCommentLevelForArticles(
		user: UserDocument,
		article: ArticleDocument,
		createDto: CreateATopLevelCommentDto,
	) {
		const { content } = createDto;

		const session = await this.connection.startSession();
		session.startTransaction();

		const newComment = new this.commentsModel({
			owner: user._id,
			content,
			depth: 0,
			entityId: article._id,
			entityType: Article.name,
		});

		await newComment.save({ session });

		await this.articleService.incrementCommentsCount(article, session);

		await session.commitTransaction();
		await session.endSession();

		return newComment._id;
	}

	async createReplyComment(
		user: UserDocument,
		parentComment: CommentDocument,
		createDto: CreateReplyCommentDto,
	) {
		const { content } = createDto;

		const session = await this.connection.startSession();
		session.startTransaction();

		if (parentComment.depth + 1 > MAXIMUM_COMMENTS_DEPTH)
			throw new NotAcceptableException('maximum depth exceeded!');

		const newComment = new this.commentsModel({
			owner: user._id,
			content,
			depth: parentComment.depth + 1,
			entityId: parentComment.entityId,
			entityType: parentComment.entityType,
			parentId: parentComment._id,
			rootId: parentComment.rootId,
		});

		newComment.path = parentComment.path + `/${newComment._id}`;

		await newComment.save({ session });
		await parentComment.updateOne(
			{ $inc: { repliesCount: 1 } },
			{ session },
		);
		await this.articleService.incrementCommentsCountById(
			parentComment.entityId.toHexString(),
			session,
		);

		await session.commitTransaction();
		await session.endSession();
	}

	async listCurrentUserComments(userId: string, listOpts: ListCommentsOpts) {
		const { sort } = listOpts;

		let query: QueryFilter<Comment> = {
			owner: userId,
			status: COMMENT_STATUS.ACTIVE,
			deletedAt: { $exists: false },
		};

		return this.commentsModel
			.find(query)
			.sort(sort as Record<string, SortOrder | { $meta: any }>);
	}
}
