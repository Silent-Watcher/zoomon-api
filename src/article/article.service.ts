import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from './article.schema';
import { Model, ProjectionType, QueryOptions, Types } from 'mongoose';
import { CreateArticleDto } from './dtos/create-article.dto';
import readingTime from 'reading-time';
import { Category } from '../category/category.schema';

@Injectable()
export class ArticleService {
	constructor(
		@InjectModel(Article.name)
		private readonly articleModel: Model<Article>,
		@InjectModel(Category.name)
		private readonly categoryModel: Model<Category>,
	) {}

	findById(
		id: string,
		projection: ProjectionType<Article>,
		options: QueryOptions,
	) {
		return this.articleModel.findById(id, projection, options);
	}

	async create(dto: CreateArticleDto, authorId: string) {
		const { title, content, slug, subTitle, categories } = dto;

		const existenceChecks = await Promise.all(
			categories.map((id) => this.categoryModel.exists({ _id: id })),
		);
		const allExist = existenceChecks.every((result) => result !== null);

		if (!allExist) {
			throw new NotFoundException(`One or more categories do not exist`);
		}

		// todo: check if the current user is an author! (after adding aAuthorization)
		const { minutes } = readingTime(content);

		return this.articleModel.create({
			authorId,
			title,
			subTitle,
			content,
			slug,
			categories,
			timeToRead: Math.ceil(minutes),
		});
	}
}
