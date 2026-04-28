import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ArticleService } from './article.service';
import { User } from '../user/decorators/user.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CreateArticleDto } from './dtos/create-article.dto';
import { Etag } from '../common/decorators/etag.decorator';
import { OptimisticLock } from '../common/decorators/optimistic-lock.decorator';
import { Operation } from 'fast-json-patch';

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

	@OptimisticLock()
	@Patch(':id')
	patchOneById(
		@Param('id', ParseObjectIdPipe) id: string,
		@Body() patchDto: Operation[],
	) {
		// todo: AUTHORIZATION: check if the current user has the ability to update this article
	}
}
