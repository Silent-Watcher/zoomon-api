import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './comment.schema';
import { ArticleModule } from '../article/article.module';
import { Article, ArticleSchema } from '../article/article.schema';
import { versionFieldMiddleware } from '../common/helpers/mongo.helper';

@Module({
	imports: [
		ArticleModule,
		MongooseModule.forFeatureAsync([
			{
				name: Comment.name,
				useFactory: () => {
					const schema = CommentSchema;
					versionFieldMiddleware(schema);
					return schema;
				},
			},
			{ name: Article.name, useFactory: () => ArticleSchema },
		]),
	],
	controllers: [CommentController],
	providers: [CommentService],
})
export class CommentModule {}
