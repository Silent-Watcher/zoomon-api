import { Controller, Param, Post } from '@nestjs/common';
import { User } from '../user/decorators/user.decorator';
import { LikeService } from './like.service';
import { articleByIdPipe } from '../article/pipes/article-by-id.pipe';
import type { ArticleDocument } from '../article/article.schema';
import { commentByIdPipe } from '../comment/pipes/commentById.pipe';
import type { CommentDocument } from '../comment/comment.schema';

@Controller('likes')
export class LikeController {
	constructor(private readonly likeService: LikeService) {}

	@Post('/articles/:id')
	SubmitOrRetriveLikeForArticle(
		@User('id') userId: string,
		@Param(
			'id',
			articleByIdPipe({ likesCount: 1, _id: 1 }, { lean: false }),
		)
		article: ArticleDocument,
	) {
		return this.likeService.SubmitOrRetriveLikeForArticle(userId, article);
	}

	@Post('/comments/:id')
	SubmitOrRetriveLikeForComment(
		@User('id') userId: string,
		@Param(
			'id',
			commentByIdPipe({
				queryOptions: { lean: false },
				projection: {
					likesCount: 1,
					_id: 1,
					owner: 1,
					content: 1,
					entityId: 1,
					entityType: 1,
					id: 1,
				},
				populate: { path: 'entityId', select: 'content' },
			}),
		)
		comment: CommentDocument,
	) {
		return this.likeService.SubmitOrRetriveLikeForComment(userId, comment);
	}
}
