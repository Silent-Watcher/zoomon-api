import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotAcceptableException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { emailRegex, phoneRegex } from '../common/constants/regex';
import { Otp, OtpService } from '../otp/otp.service';
import { AppLogger } from '../logger/logger.service';
import { comparePassword } from '../common/helpers/password.helper';

export enum IDENTIFIERS {
	EMAIL = 'email',
	PHONE = 'phone',
}
export type Identifier =
	| `${(typeof IDENTIFIERS)[keyof typeof IDENTIFIERS]}`
	| undefined;

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly otpService: OtpService,
		private readonly logger: AppLogger,
	) {
		this.logger.setContext(AuthService.name);
	}

	async signIn(identifier: string) {
		const userExists = await this.userService.findOneByIdentifier(
			identifier,
			{ _id: 1, password: 1 },
		);

		if (!userExists || (userExists && !userExists.password)) {
			return {
				redirectTo: `/account/otp?identifier=${identifier}`,
			};
		}

		if (userExists && userExists.password) {
			return {
				redirectTo: `/account/password?identifier=${identifier}`,
			};
		}

		throw new InternalServerErrorException('Something went wrong');
	}

	async issueOtp(identifier: string) {
		let otp: string | null;

		const storedOtp = await this.otpService.fetch(identifier);

		if (storedOtp) throw new BadRequestException('already sent');

		otp = await this.otpService.createFor(identifier);
		const rawOtp: Otp = JSON.parse(otp);

		//---> if otp status is pending you can start send sms/email
		// TODO: send email or sms the otp
		//---> inside the worker after calling the sms/email service set status to sent
		this.logger.debug({ otp: rawOtp }, 'issued OTP');

		return {
			msg: 'issued!',
			otpId: rawOtp.id,
		};
	}

	async verifyByOtp(identifier: string, otp: string) {
		const storedOtp = await this.otpService.fetch(identifier);

		if (!storedOtp) throw new BadRequestException('OTP Expired!');

		const rawOtp: Otp = JSON.parse(storedOtp);

		if (rawOtp.code !== storedOtp)
			throw new BadRequestException('Invalid OTP');

		await this.otpService.del(identifier);

		let user = await this.userService.findOneByIdentifier(identifier, {
			_id: 1,
		});

		if (!user) {
			user = await this.userService.create(
				identifier,
				this.getIdentifierType(identifier),
			);
		}
		return { userId: user._id, verified: true };
	}

	async verifyByPassword(identifier: string, password: string) {
		const user = await this.userService.findOneByIdentifier(identifier, {
			_id: 1,
			password: 1,
		});
		if (!user) throw new BadRequestException('User not found!');

		if (!user.password)
			throw new BadRequestException('User has not set any password');

		if (!comparePassword(password, user.password))
			throw new NotAcceptableException('invalid password');

		return { userId: user._id, verified: true };
	}

	async cancelOtp(identifier: string, otpId: string): Promise<void> {
		const otp = await this.otpService.getDel(identifier);
		if (otp) {
			const rawOtp: Otp = JSON.parse(otp);
			if (rawOtp.id !== otpId)
				throw new BadRequestException(
					'Invalid OTP id for this identifier',
				);
			//TODO: remove sending otp job from queue
		}
		return;
	}

	private getIdentifierType(identifier: string): Identifier {
		if (emailRegex.test(identifier)) return 'email';
		if (phoneRegex.test(identifier)) return 'phone';
		return undefined;
	}
}
