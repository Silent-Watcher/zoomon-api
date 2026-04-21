import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsEmailOrPhone } from '../../common/validators/isEmailOrPhone.validator';

export class CancelOtpDto {
	@IsString({ message: 'invalid identifier Data type' })
	@IsNotEmpty()
	@IsEmailOrPhone({
		message: 'identifier must be a valid email or phone number',
	})
	declare identifier: string;

	@IsString({ message: 'invalid otpId Data type' })
	@IsNotEmpty()
	@IsUUID('4')
	declare otpId: string;
}
