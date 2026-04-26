import { IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { Match } from '../../common/validators/match.validator';

export class SetPasswordDto {
	@IsOptional()
	@IsString()
	@IsStrongPassword()
	oldPassword?: string;

	@IsString()
	@IsStrongPassword()
	declare password: string;

	@IsString()
	@Match('password', { message: 'confirmPassword must match password' })
	declare confirmPassword: string;
}
