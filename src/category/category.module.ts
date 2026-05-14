import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './category.schema';
import { versionFieldMiddleware } from '../common/helpers/mongo.helper';
import { Article, ArticleSchema } from '../article/article.schema';
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { LoggerModule } from '../logger/logger.module';
import { UtilModule } from '../util/util.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Category.name,
				useFactory() {
					const schema = CategorySchema;
					versionFieldMiddleware(schema);
					return schema;
				},
			},
			{ name: Article.name, useFactory: () => ArticleSchema },
		]),
		LoggerModule,
		UtilModule,
		IdempotencyModule,
	],
	controllers: [CategoryController],
	providers: [CategoryService],
})
export class CategoryModule {}
