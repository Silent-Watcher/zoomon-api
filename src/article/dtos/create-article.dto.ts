import { Transform } from 'class-transformer';
import {
	IsBoolean,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
} from 'class-validator';
import sanitizeHtml from 'sanitize-html';
import slugify from 'slugify';
import {
	MAXIMUM_ARTICLE_SUB_TITLE_LENGTH,
	MAXIMUM_ARTICLE_TITLE_LENGTH,
	MINIMUM_ARTICLE_SUB_TITLE_LENGTH,
	MINIMUM_ARTICLE_TITLE_LENGTH,
} from '../article.constant';

export class CreateArticleDto {
	@IsString()
	@IsNotEmpty()
	@Length(MINIMUM_ARTICLE_TITLE_LENGTH, MAXIMUM_ARTICLE_TITLE_LENGTH)
	@Transform(({ value }) =>
		value.trim().replace(/[<>]/g, ' ').replace(/\s+/g, ' '),
	)
	declare title: string;

	@IsOptional()
	@IsString()
	@Length(MINIMUM_ARTICLE_SUB_TITLE_LENGTH, MAXIMUM_ARTICLE_SUB_TITLE_LENGTH)
	@Transform(({ value }) =>
		value
			.trim()
			.replace(/[<>]/g, ' ') // replace < and > with space
			.replace(/\s+/g, ' '),
	)
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

	@IsOptional()
	@IsMongoId({ each: true })
	categories?: string[];

	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => Boolean(value))
	isPublished?: boolean;

	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => Boolean(value))
	isPremium?: boolean;
}
