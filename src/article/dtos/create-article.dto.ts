import { Transform } from 'class-transformer';
import {
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
} from 'class-validator';
import sanitizeHtml from 'sanitize-html';
import slugify from 'slugify';

export class CreateArticleDto {
	@IsString()
	@IsNotEmpty()
	@Length(5, 50)
	@Transform(({ value }) => value.trim().replace(/<[^>]*>/g, ''))
	declare title: string;

	@IsOptional()
	@IsString()
	@Length(5, 50)
	@Transform(({ value }) => value.trim().replace(/<[^>]*>/g, ''))
	subTitle?: string;

	@IsOptional()
	@IsString()
	@Transform(({ value }) => slugify(value))
	slug?: string;

	@IsString()
	@Length(10, 50_000)
	@Transform(({ value }) =>
		sanitizeHtml(value, {
			allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'section'],
		}),
	)
	declare content: string;

	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	// @IsMongoId({ each: true })
	declare categories: string[];
}
