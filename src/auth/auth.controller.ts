import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Post,
	Req,
	Res,
	Session,
	UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dtos/SendOtpDto';
import { SigninDto } from './dtos/signin.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { VerifyPasswordDto } from './dtos/verify-password.dto';
import { BlockIfAuthenticated } from './guards/blockIfAuthenticated.guard';
import { Secured } from './guards/secured.guard';
import { CancelOtpDto } from './dtos/cancel-otp';

@Controller('account')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(BlockIfAuthenticated)
	@HttpCode(HttpStatus.ACCEPTED)
	@Post('login')
	signIn(@Body() signInDto: SigninDto) {
		const { identifier } = signInDto;
		return this.authService.signIn(identifier);
	}

	@UseGuards(BlockIfAuthenticated)
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

	@UseGuards(BlockIfAuthenticated)
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

	@UseGuards(BlockIfAuthenticated)
	@HttpCode(HttpStatus.OK)
	@Post('send-otp')
	async sendOtp(@Body() sendOtpDto: SendOtpDto, @Res() res: Response) {
		const { identifier } = sendOtpDto;
		await this.authService.issueOtp(identifier);
		res.sendStatus(HttpStatus.OK);
	}

	@UseGuards(Secured)
	@Get('logout')
	async logout(@Req() req: Request, @Res() res: Response) {
		req.session.destroy((err) => {
			if (err)
				throw new InternalServerErrorException(
					'Failed to destroy session',
				);
		});
		res.sendStatus(HttpStatus.OK);
	}

	@Post('cancel-otp')
	async cancelOtp(@Body() cancelOtpDto: CancelOtpDto, @Res() res: Response) {
		const { identifier, otpId } = cancelOtpDto;

		await this.authService.cancelOtp(identifier, otpId);

		res.sendStatus(HttpStatus.OK);
	}
}
