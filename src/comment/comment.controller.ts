import { Body, Controller, Param, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { User } from '../user/decorators/user.decorator';
import type { UserDocument } from '../user/user.schema';
import { CreateATopLevelCommentDto } from './dtos/create-a-top-level-comment.dto';
import { articleByIdPipe } from '../article/pipes/article-by-id.pipe';
import type { ArticleDocument } from '../article/article.schema';

@Controller('comments')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}

	@Post('articles/:id')
	createATopCommentLevel(
		@User() user: UserDocument,
		@Param('id', articleByIdPipe({}, { lean: false }))
		article: ArticleDocument,
		@Body() createATopLevelCommentDto: CreateATopLevelCommentDto,
	) {
		return this.commentService.createATopCommentLevelForArticles(
			user,
			article,
			createATopLevelCommentDto,
		);
	}
}
