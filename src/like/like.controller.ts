import { Controller, Param, Post } from '@nestjs/common';
import { User } from '../user/decorators/user.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { LikeService } from './like.service';

@Controller('likes')
export class LikeController {
	constructor(private readonly likeService: LikeService) {}

	@Post('/articles/:id')
	SubmitOrRetriveLikeForArticle(
		@User('id') userId: string,
		@Param('id', ParseObjectIdPipe) articleId: string,
	) {
		return this.likeService.SubmitOrRetriveLikeForArticle(
			userId,
			articleId,
		);
	}
}
