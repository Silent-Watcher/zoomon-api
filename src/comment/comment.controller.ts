import { Body, Controller, Param, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { User } from '../user/decorators/user.decorator';
import type { UserDocument } from '../user/user.schema';
import { CreateATopLevelCommentDto } from './dtos/create-a-top-level-comment.dto';
import { articleByIdPipe } from '../article/pipes/article-by-id.pipe';
import type { ArticleDocument } from '../article/article.schema';
import type { CommentDocument } from './comment.schema';
import { commentByIdPipe } from './pipes/commentById.pipe';

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

	@Post('replies/:parentId')
	createReplyComment(
		@User() user: UserDocument,
		@Body() createReplyDto: any,
		@Param('parentId', commentByIdPipe({}, { lean: false }))
		parentComment: CommentDocument,
	) {
		return this.commentService.createReplyComment(
			user,
			parentComment,
			createReplyDto,
		);
	}
}
