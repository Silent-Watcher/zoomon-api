import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './article.schema';
import { versionFieldMiddleware } from '../common/helpers/mongo.helper';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Article.name,
				useFactory() {
					const schema = ArticleSchema;
					versionFieldMiddleware(schema);
					return schema;
				},
			},
		]),
	],
	controllers: [ArticleController],
	providers: [ArticleService],
	exports: [ArticleService],
})
export class ArticleModule {}
