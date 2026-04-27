import { Body, Controller, Post } from '@nestjs/common';
import { ArticleService } from './article.service';
import { User } from '../user/decorators/user.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CreateArticleDto } from './dtos/create-article.dto';

@Controller('articles')
export class ArticleController {
	constructor(private readonly articleService: ArticleService) {}

	@Post()
	create(
		@User('id', ParseObjectIdPipe) userId: string,
		@Body() createArticleDto: CreateArticleDto,
	) {
		return this.articleService.create(createArticleDto, userId);
	}
}
