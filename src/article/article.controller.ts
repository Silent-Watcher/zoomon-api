import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
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

@Etag('id', ArticleService)
@Controller('articles')
export class ArticleController {
	constructor(private readonly articleService: ArticleService) {}

	@Post()
	create(
		@User('id', ParseObjectIdPipe) userId: string,
		@Body() createDto: CreateArticleDto,
	) {
		return this.articleService.create(createDto, userId);
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
	) {
		return this.articleService.deleteOne(article as ArticleDocument);
	}
}
