import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './comment.schema';
import { ArticleModule } from '../article/article.module';
import { Article, ArticleSchema } from '../article/article.schema';

@Module({
	imports: [
		ArticleModule,
		MongooseModule.forFeature([
			{ name: Comment.name, schema: CommentSchema },
			{ name: Article.name, schema: ArticleSchema },
		]),
	],
	controllers: [CommentController],
	providers: [CommentService],
})
export class CommentModule {}
