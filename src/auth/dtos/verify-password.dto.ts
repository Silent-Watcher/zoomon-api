import { IsNotEmpty, IsString } from 'class-validator';
import { IsEmailOrPhone } from '../../common/validators/isEmailOrPhone.validator';

export class VerifyPasswordDto {
	@IsString({ message: 'invalid identifier Data type' })
	@IsNotEmpty()
	@IsEmailOrPhone({
		message: 'identifier must be a valid email or phone number',
	})
	declare identifier: string;

	@IsString({ message: 'invalid password Data type' })
	@IsNotEmpty()
	declare password: string;
}
