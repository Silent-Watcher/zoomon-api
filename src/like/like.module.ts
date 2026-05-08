import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './like.schema';
import { ArticleModule } from '../article/article.module';
import { CommentSchema } from '../comment/comment.schema';
import { Comment } from '../comment/comment.schema';
import { Article, ArticleSchema } from '../article/article.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Like.name, schema: LikeSchema },
			{ name: Comment.name, schema: CommentSchema },
			{ name: Article.name, schema: ArticleSchema },
		]),
		ArticleModule,
	],
	controllers: [LikeController],
	providers: [LikeService],
})
export class LikeModule {}
