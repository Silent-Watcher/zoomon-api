import {
	Body,
	Controller,
	ForbiddenException,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Post,
	Req,
	Res,
	Session,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dtos/signin.dto';
import { VerifyPasswordDto } from './dtos/verify-password.dto';
import { VerifyOtpDto } from './dtos/Verify-otp.dto';
import { SendOtpDto } from './dtos/SendOtpDto';
import type { Request, Response } from 'express';

@Controller('account')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@HttpCode(HttpStatus.ACCEPTED)
	@Post('login')
	signIn(@Body() signInDto: SigninDto) {
		const { identifier } = signInDto;
		return this.authService.signIn(identifier);
	}

	@HttpCode(HttpStatus.OK)
	@Post('verify-password')
	async verifyPassword(
		@Body() verifyPasswordDt0: VerifyPasswordDto,
		@Session() session: Record<string, any>,
	) {
		const { identifier, password } = verifyPasswordDt0;
		const { userId, verified } = await this.authService.verifyByPassword(
			identifier,
			password,
		);

		session['userId'] = userId.toHexString();

		return { verified };
	}

	@HttpCode(HttpStatus.OK)
	@Post('verify-otp')
	async verifyOtp(
		@Body() verifyOtpDto: VerifyOtpDto,
		@Session() session: Record<string, any>,
	) {
		const { identifier, otp } = verifyOtpDto;
		const { userId, verified } = await this.authService.verifyByOtp(
			identifier,
			otp,
		);

		session['userId'] = userId.toHexString();
		return { verified };
	}

	@HttpCode(HttpStatus.OK)
	@Post('send-otp')
	async sendOtp(@Body() sendOtpDto: SendOtpDto, @Res() res: Response) {
		const { identifier } = sendOtpDto;
		await this.authService.issueOtp(identifier);
		res.sendStatus(HttpStatus.OK);
	}

	@Get('logout')
	async logout(@Req() req: Request, @Res() res: Response) {
		if (!req.session['userId'])
			throw new ForbiddenException('unsupported request');

		req.session.destroy((err) => {
			if (err)
				throw new InternalServerErrorException(
					'Failed to destroy session',
				);
		});

		res.sendStatus(HttpStatus.OK);
	}
}
