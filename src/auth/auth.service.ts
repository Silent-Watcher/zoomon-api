import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { emailRegex, phoneRegex } from '../common/constants/regex';

export enum IDENTIFIERS {
	EMAIL = 'email',
	PHONE = 'phone',
}
export type Identifier =
	| `${(typeof IDENTIFIERS)[keyof typeof IDENTIFIERS]}`
	| undefined;

interface VerifyByOtpParams {
	identifier: string;
	type: Identifier;
	otpValue: string;
	otpId: string;
	newUser: boolean;
}

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService) {}

	async signIn(identifier: string) {
		const identifierType: Identifier = this.getIdentifierType(identifier);

		const userExists = await this.userService.findOneByIdentifier(
			identifier,
			{ _id: 1, password: 1 },
		);

		if (!userExists || (userExists && !userExists.password)) {
			// TODO: generate and store otp inside redis and main db!
			return {
				redirectTo: `/api/account/verifyCode?emailOrPhoneNumber=${identifier}&type=${identifierType}&newUser=${userExists ? false : true}`,
			};
		}

		if (userExists && userExists.password) {
			return {
				redirectTo: `/api/account/password?identifier=${identifier}`,
			};
		}

		throw new InternalServerErrorException('Something went wrong');
	}

	async verifyByOtp(params: VerifyByOtpParams) {
		// get otp from redis
		// if redis was unavailable read from main.db
		// check if the input otp is equal to stored otp
		// if newUser: true:
		//----> then create a new user with that specific identifier type
		// add user_id into the session!(and the cookie sent to the browser)
		// return {verified: true, userId: user._id}
	}

	async verifyByPassword(identifier: string, password: string) {
		// in this case we know that user already defined
		// get the user with identifier
		// if not exists sent not found error!
		// check passwords (verify with the hashed stored password)
		// if they were equal :
		// -----> return {verified: true, userId: user._id}
		// if not :
		//------>  throw 401 response (invalid password)
	}

	private getIdentifierType(identifier: string): Identifier {
		if (emailRegex.test(identifier)) return 'email';
		if (phoneRegex.test(identifier)) return 'phone';
		return undefined;
	}
}
