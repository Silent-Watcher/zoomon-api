import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Article, ArticleDocument } from './article.schema';
import { ClientSession, Model, ProjectionType, QueryOptions } from 'mongoose';
import { CreateArticleDto } from './dtos/create-article.dto';
import readingTime from 'reading-time';
import { Category } from '../category/category.schema';
import { Operation } from 'fast-json-patch';
import { validateJsonPatch } from '../common/helpers/patch.helper';
import jsonpatch from 'fast-json-patch';
import { validateInstanceWithDto } from '../common/helpers/dto.helper';
import { PatchArticleDto } from './dtos/patch-article.dto';

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
	//
	async create(dto: CreateArticleDto, authorId: string) {
		const { title, content, slug, subTitle, categories } = dto;

		if (categories) {
			const existenceChecks = await Promise.all(
				categories.map((id) => this.categoryModel.exists({ _id: id })),
			);
			const allExist = existenceChecks.every((result) => result !== null);

			if (!allExist) {
				throw new NotFoundException(
					`One or more categories do not exist`,
				);
			}
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
	//
	async patchOne(article: Article, jsonPatch: Operation[]) {
		// todo: check if the user is admin or the author of the post
		// todo: if the user is a moderator or admin then we can also accept the isPublished field and change it

		validateJsonPatch<Article>(jsonPatch, article);

		const docClone = JSON.parse(JSON.stringify(article));
		const patchResult = jsonpatch.applyPatch<Article>(
			docClone,
			jsonPatch,
		).newDocument;

		const patchedCategories = patchResult.categories;

		if (patchedCategories) {
			const existenceChecks = await Promise.all(
				patchedCategories.map((id) =>
					this.categoryModel.exists({ _id: id }),
				),
			);
			const allExist = existenceChecks.every((result) => result !== null);

			if (!allExist) {
				throw new NotFoundException(
					`One or more categories do not exist`,
				);
			}
		}

		validateInstanceWithDto(PatchArticleDto, patchResult);

		const {
			title,
			subTitle,
			content,
			slug,
			categories,
			isPremium,
			isPublished,
		} = patchResult;
		const { acknowledged, modifiedCount } =
			await this.articleModel.updateOne(
				{ _id: article._id },
				{
					$set: {
						title,
						subTitle,
						content,
						slug,
						categories,
						isPremium,
						isPublished,
					},
				},
			);

		return { acknowledged, modifiedCount };
	}

	async existsById(id: string): Promise<boolean> {
		const result = await this.articleModel.exists({ _id: id });
		return result ? true : false;
	}

	async deleteOne(article: ArticleDocument) {
		return article.updateOne({
			$set: { deletedAt: new Date() },
		});
	}

	async incrementCommentsCount(
		article: ArticleDocument,
		session?: ClientSession,
	) {
		return article.updateOne({ $inc: { commentsCount: 1 } }, { session });
	}
}
