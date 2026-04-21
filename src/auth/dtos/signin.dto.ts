import { IsNotEmpty, IsString } from 'class-validator';
import { IsEmailOrPhone } from '../../common/validators/isEmailOrPhone.validator';

export class SigninDto {
	@IsString({ message: 'invalid identifier Data type' })
	@IsNotEmpty()
	@IsEmailOrPhone({
		message: 'identifier must be a valid email or phone number',
	})
	declare identifier: string;
}
