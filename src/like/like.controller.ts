import { Controller, Param, Post } from '@nestjs/common';
import { User } from '../user/decorators/user.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('likes')
export class LikeController {
	@Post('/articles/:id')
	SubmitOrRetriveLikeForArticle(
		@User('id') userId: string,
		@Param('id', ParseObjectIdPipe) articleId: string,
	) {}
}
