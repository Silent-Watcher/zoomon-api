import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Comment } from './comment.schema';
import { UserDocument } from '../user/user.schema';
import { CreateATopLevelCommentDto } from './dtos/create-a-top-level-comment.dto';
import { Article, ArticleDocument } from '../article/article.schema';
import { ArticleService } from '../article/article.service';

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
}
