import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import jsonpatch, { Operation } from 'fast-json-patch';
import {
	ClientSession,
	Connection,
	Model,
	ProjectionType,
	QueryFilter,
	QueryOptions,
	Types,
	UpdateResult,
} from 'mongoose';
import readingTime from 'reading-time';
import { Category } from '../category/category.schema';
import { validateInstanceWithDto } from '../common/helpers/dto.helper';
import { SortObject } from '../common/helpers/mongo.helper';
import { validateJsonPatch } from '../common/helpers/patch.helper';
import { ListAllOptions } from '../common/interfaces/api.interface';
import { CursorUtil } from '../util/cursor.util';
import { SORT_ARTICLE_SPECS } from './article.constant';
import { SortArticle } from './article.interface';
import { Article, ArticleDocument } from './article.schema';
import { CreateArticleDto } from './dtos/create-article.dto';
import { PatchArticleDto } from './dtos/patch-article.dto';
import { OptimisticLockableService } from '../common/interfaces/optimistic-lockable.interface';
import { IdempotencyRequestData } from '../idempotency/idempotency.interface';
import { IdempotencyService } from '../idempotency/idempotency.service';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { AppLogger } from '../logger/logger.service';
import { IdempotentService } from '../idempotency/idempotent-service.abstract';
import { IDEMPOTENCY_OPERATION } from '../idempotency/idempotency.constant';

@Injectable()
export class ArticleService
	extends IdempotentService
	implements
		OptimisticLockableService<Article, ArticleDocument | Article | null>
{
	constructor(
		@InjectModel(Article.name)
		private readonly articleModel: Model<Article>,
		@InjectModel(Category.name)
		private readonly categoryModel: Model<Category>,
		private readonly cursorUtil: CursorUtil,
		protected readonly idempotencyService: IdempotencyService,
		@InjectRedis() protected readonly redis: Redis,
		protected readonly logger: AppLogger,
		@InjectConnection() private readonly connection: Connection,
	) {
		super(idempotencyService, redis, logger);
		this.logger.setContext(ArticleService.name);
	}

	findById(
		id: string,
		projection: ProjectionType<Article>,
		options: QueryOptions,
	) {
		return this.articleModel.findById(id, projection, options);
	}
	//
	async create(
		dto: CreateArticleDto,
		authorId: string,
		idempotencyData: IdempotencyRequestData,
	) {
		const newArticleId = new Types.ObjectId();

		const session = await this.connection.startSession();
		session.startTransaction();

		return this.executeIdempotent(
			IDEMPOTENCY_OPERATION.CREATE_ARTICLE,
			idempotencyData,
			authorId,
			newArticleId.toHexString(),
			async () => {
				const { title, content, slug, subTitle, categories } = dto;

				if (categories) {
					const existenceChecks = await Promise.all(
						categories.map((id) =>
							this.categoryModel.exists({ _id: id }),
						),
					);
					const allExist = existenceChecks.every(
						(result) => result !== null,
					);

					if (!allExist) {
						throw new NotFoundException(
							`One or more categories do not exist`,
						);
					}
				}

				// todo: check if the current user is an author! (after adding aAuthorization)
				const { minutes } = readingTime(content);

				const newArticle = new this.articleModel(
					{
						authorId,
						title,
						subTitle,
						content,
						slug,
						categories,
						timeToRead: Math.ceil(minutes),
					},
					{ version: 0 },
				);

				await newArticle.save({ session });

				return {
					body: newArticle.toObject(),
					code: HttpStatus.CREATED,
				};
			},
			{ session },
		);
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

	async deleteOne(article: ArticleDocument): Promise<UpdateResult> {
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

	async incrementCommentsCountById(
		articleId: string,
		session?: ClientSession,
	) {
		return this.articleModel.findOneAndUpdate(
			{ _id: articleId },
			{ $inc: { commentsCount: 1 } },
			{ session },
		);
	}

	async listAll(opts: ListAllOptions<SortArticle>) {
		let { cursor, limit, sort } = opts;

		let query: QueryFilter<Article> = {
			isPublished: true,
			deletedAt: { $exists: false },
		};

		const projection: ProjectionType<Article> = {
			title: 1,
			createdAt: 1,
			commentsCount: 1,
			likesCount: 1,
		};

		let sortSpec = this.getSortSpec(sort);
		const primarySortKey = Object.keys(sortSpec)[0] as keyof Article;

		if (cursor) {
			const cursorQuery = this.createCursorQuery(sortSpec, cursor);
			if (cursorQuery) query.$or = cursorQuery;
		}

		const docs = await this.articleModel
			.find(query, projection)
			.sort(sortSpec)
			.limit((limit as number) + 1)
			.lean();

		let articles: (Article | null)[] = docs;

		const hasNextPage = docs.length > (limit as number);
		articles = hasNextPage ? docs.slice(0, -1) : docs;
		const lastArticle =
			docs.length > 0 ? (articles.at(-1) as Article) : null;

		const primaryValueForNextCursor =
			lastArticle && hasNextPage ? lastArticle[primarySortKey] : null;

		const nextCursor = hasNextPage
			? this.cursorUtil.sign({
					primary: primaryValueForNextCursor,
					id: lastArticle?.id ?? lastArticle?._id.toString()!,
				})
			: null;

		return {
			data: articles,
			meta: {
				hasNextPage,
				nextCursor,
			},
		};
	}

	private getSortSpec(
		sort: SortArticle | string | undefined,
	): SortObject<Article> {
		let sortSpec: SortObject<Article> = { createdAt: 'desc', _id: 1 };

		if (sort) {
			if (typeof sort == 'string') {
				switch (sort) {
					case SORT_ARTICLE_SPECS.NEWEST:
						sortSpec = { createdAt: 'desc', _id: 1 };
						break;
					case SORT_ARTICLE_SPECS.OLDEST:
						sortSpec = { createdAt: 'asc', _id: 1 };
						break;
					case SORT_ARTICLE_SPECS.MOST_COMMENTED:
						sortSpec = { commentsCount: 'desc', _id: 1 };
						break;
					case SORT_ARTICLE_SPECS.MOST_LIKED:
						sortSpec = { likesCount: 'desc', _id: 1 };
						break;
					default:
						sortSpec = { createdAt: 'desc', _id: 1 };
						break;
				}
			} else if (typeof sort == 'object' && !Array.isArray(sort)) {
				sortSpec = { ...sort, _id: 1 };
			}
		}

		return sortSpec;
	}

	private createCursorQuery(sortSpec: SortObject<Article>, cursor: string) {
		const primarySortKey = Object.keys(sortSpec)[0] as keyof Article;
		const primaryOperation =
			(sortSpec[primarySortKey] as any) > 0 ? '$gt' : '$lt';
		const uniqueTieBreakerOperation =
			(sortSpec._id as any) > 0 ? '$gt' : '$lt';

		const decodedCursor = cursor ? this.cursorUtil.verify(cursor) : null;

		if (decodedCursor) {
			let inputPrimary = decodedCursor.primary as any;
			const inputUniqueTieBreaker = new Types.ObjectId(decodedCursor.id);

			const dateFields: (keyof Article)[] = ['createdAt'];
			if (dateFields.includes(inputPrimary)) {
				inputPrimary = new Date(inputPrimary);
			}

			return [
				{ [primarySortKey]: { [primaryOperation]: inputPrimary } },
				{
					[primarySortKey]: inputPrimary,
					_id: { [uniqueTieBreakerOperation]: inputUniqueTieBreaker },
				},
			];
		}

		return null;
	}
}
