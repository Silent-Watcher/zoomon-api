import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAXIMUM_COMMENT_CONTENT_LENGTH } from '../comment.constant';

export class CreateReplyCommentDto {
	@IsNotEmpty()
	@IsString()
	@MaxLength(MAXIMUM_COMMENT_CONTENT_LENGTH)
	declare content: string;
}
