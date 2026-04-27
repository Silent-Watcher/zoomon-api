import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from './article.schema';
import { Model, ProjectionType, QueryOptions } from 'mongoose';

@Injectable()
export class ArticleService {
	constructor(
		@InjectModel(Article.name)
		private readonly articleModel: Model<Article>,
	) {}

	findById(
		id: string,
		projection: ProjectionType<Article>,
		options: QueryOptions,
	) {
		return this.articleModel.findById(id, projection, options);
	}
}
