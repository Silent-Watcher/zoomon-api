import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class ReplaceCategoryDto {
	@IsString()
	@Length(3, 50)
	// @Transform(({ value }) => { (value as string).trim().toLowerCase().replace(/<[^>]*>/g, '') })
	declare name: string;
}
