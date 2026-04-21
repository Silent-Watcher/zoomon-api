import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsEmailOrPhone } from '../../common/validators/isEmailOrPhone.validator';
import { MAX_OTP_LENGTH } from '../../otp/otp.constant';

export class VerifyOtpDto {
	@IsString({ message: 'invalid identifier Data type' })
	@IsNotEmpty()
	@IsEmailOrPhone({
		message: 'identifier must be a valid email or phone number',
	})
	declare identifier: string;

	@IsString({ message: 'invalid password Data type' })
	@IsNotEmpty()
	@MaxLength(MAX_OTP_LENGTH)
	declare otp: string;
}
