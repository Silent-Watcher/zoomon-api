import {
	Body,
	Controller,
	DefaultValuePipe,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
	UsePipes,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { User } from '../user/decorators/user.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CreateArticleDto } from './dtos/create-article.dto';
import { Etag } from '../common/decorators/etag.decorator';
import { OptimisticLock } from '../common/decorators/optimistic-lock.decorator';
import { Operation } from 'fast-json-patch';
import { CacheWithEtag } from '../common/decorators/cache-with-etag.decorator';
import { articleByIdPipe } from './pipes/article-by-id.pipe';
import { Article, ArticleDocument } from './article.schema';
import { UpdateResult } from 'mongoose';
import { MAXIMUM_ARTICLE_PER_PAGE } from './article.constant';
import type { SortArticle } from './article.interface';
import { sortPipe } from '../common/pipes/sort.pipe';
import { sortArticleSchema } from './validation/sort.schema';
import { Idempotent } from '../common/decorators/idempotent.decorator';
import { IdempotencyData } from '../common/decorators/idempotency-data.decorator';
import type { IdempotencyRequestData } from '../idempotency/idempotency.interface';
import type { Request } from 'express';
import { ApiUtil } from '../util/api.util';

@Etag('id', ArticleService)
@Controller('articles')
export class ArticleController {
	constructor(
		private readonly articleService: ArticleService,
		private readonly apiUtil: ApiUtil,
	) {}

	@Idempotent()
	@Post()
	async create(
		@User('id', ParseObjectIdPipe) userId: string,
		@Body() createDto: CreateArticleDto,
		@IdempotencyData() idempotencyData: IdempotencyRequestData,
		@Req() request: Request,
	) {
		const result = await this.articleService.create(
			createDto,
			userId,
			idempotencyData,
		);
		return {
			__location: this.apiUtil.getEntityLocationHeaderValue(
				result.responseBody.id,
				request,
			),
			...result,
		};
	}

	@CacheWithEtag()
	@Get(':id')
	findOne(@Param('id', articleByIdPipe()) article: Article) {
		return article;
	}

	@OptimisticLock()
	@Patch(':id')
	patchOneById(
		@Param('id', articleByIdPipe()) article: Article,
		@Body() patchDto: Operation[],
	) {
		// todo: AUTHORIZATION: check if the current user has the ability to update this article
		return this.articleService.patchOne(article, patchDto);
	}

	@Delete(':id')
	deleteOne(
		@Param('id', articleByIdPipe({}, { lean: false })) article: Article,
	): Promise<UpdateResult> {
		return this.articleService.deleteOne(article as ArticleDocument);
	}

	@UsePipes(sortPipe(sortArticleSchema))
	@Get()
	listAll(
		@Query('cursor') cursor: string,
		@Query(
			'limit',
			new DefaultValuePipe(MAXIMUM_ARTICLE_PER_PAGE),
			new ParseIntPipe({ optional: true }),
		)
		limit: number,
		@Query('sort', new DefaultValuePipe({ createdAt: 'desc' }))
		sort: SortArticle,
	) {
		return this.articleService.listAll({
			limit,
			sort,
			cursor,
		});
	}
}
