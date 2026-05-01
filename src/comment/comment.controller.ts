import {
	Body,
	Controller,
	DefaultValuePipe,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { User } from '../user/decorators/user.decorator';
import type { UserDocument } from '../user/user.schema';
import { CreateATopLevelCommentDto } from './dtos/create-a-top-level-comment.dto';
import { articleByIdPipe } from '../article/pipes/article-by-id.pipe';
import type { ArticleDocument } from '../article/article.schema';
import type { CommentDocument } from './comment.schema';
import { commentByIdPipe } from './pipes/commentById.pipe';
import type { SortComment } from './comment.interface';
import type { UpdateResult } from 'mongoose';
import { PatchCommentDto } from './dtos/patch-comment.dto';

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

	@Get()
	listCurrentUserComments(
		@User('_id') userId: string,
		@Query('sort', new DefaultValuePipe({ createdAt: 'desc' }))
		sort: SortComment,
	) {
		return this.commentService.listCurrentUserComments(userId, { sort });
	}

	@Delete(':id')
	deleteOneById(
		@Param('id', commentByIdPipe({}, { lean: false }))
		comment: CommentDocument,
	): Promise<Pick<UpdateResult, 'acknowledged' | 'modifiedCount'>> {
		// TODO: check if the current user is the comment owner or a moderator
		return this.commentService.deleteOne(comment);
	}

	@Patch(':id')
	patchOneById(
		@Param('id', commentByIdPipe({}, { lean: false }))
		comment: CommentDocument,
		@Body() patchCommentDto: PatchCommentDto,
	): Promise<Pick<UpdateResult, 'acknowledged' | 'modifiedCount'>> {
		// TODO: check if the current user is the owner of the comment
		return this.commentService.patchOne(comment, patchCommentDto);
	}
}
