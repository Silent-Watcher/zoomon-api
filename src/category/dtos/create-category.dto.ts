import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class CreateCategoryDto {
	@IsString()
	@Length(5, 20)
	@Transform(({ value }) =>
		value
			.trim()
			.toLowerCase()
			.replace(/<[^>]*>/g, ''),
	)
	declare name: string;
}
