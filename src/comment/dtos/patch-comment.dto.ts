import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAXIMUM_COMMENT_CONTENT_LENGTH } from '../comment.constant';
import { Transform } from 'class-transformer';

export class PatchCommentDto {
	@IsNotEmpty()
	@IsString()
	@MaxLength(MAXIMUM_COMMENT_CONTENT_LENGTH)
	@Transform(({ value }) => {
		return (value as string)
			.trim()
			.replace(/[<>]/g, ' ')
			.replace(/\s+/g, ' ');
	})
	declare content: string;
}
