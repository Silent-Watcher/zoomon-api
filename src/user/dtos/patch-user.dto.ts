import {
	IsDateString,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

export class PatchUserDto {
	@IsOptional()
	@IsString()
	@MinLength(3)
	@MaxLength(50, { message: 'Display name must not exceed 50 characters' })
	displayName?: string;

	@IsOptional()
	@IsString()
	@MinLength(3)
	@MaxLength(50, { message: 'City name must not exceed 50 characters' })
	city?: string;

	@IsOptional()
	@IsDateString(
		{},
		{ message: 'Birthdate must be a avalid ISO 8601 date (YYYY-MM-DD)' },
	)
	birthdata?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500, { message: 'bio must not exceed 500 characters' })
	bio?: string;
}
