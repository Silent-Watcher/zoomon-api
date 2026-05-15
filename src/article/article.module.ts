import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './article.schema';
import { versionFieldMiddleware } from '../common/helpers/mongo.helper';
import { Category, CategorySchema } from '../category/category.schema';
import { UtilModule } from '../util/util.module';
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { LoggerModule } from '../logger/logger.module';

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
			{
				name: Category.name,
				useFactory: () => CategorySchema,
			},
		]),
		UtilModule,
		IdempotencyModule,
		LoggerModule,
	],
	controllers: [ArticleController],
	providers: [ArticleService],
	exports: [ArticleService],
})
export class ArticleModule {}
