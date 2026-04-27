import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from './article.schema';
import { Model, ProjectionType, QueryOptions, Types } from 'mongoose';
import { CreateArticleDto } from './dtos/create-article.dto';
import readingTime from 'reading-time';

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

	create(dto: CreateArticleDto, authorId: string) {
		const { title, content, slug, subTitle } = dto;

		// todo: check if the current user is an author! (after adding aAuthorization)
		const { minutes } = readingTime(content);

		return this.articleModel.create({
			authorId,
			title,
			subTitle,
			content,
			slug,
			timeToRead: Math.ceil(minutes),
		});
	}
}
