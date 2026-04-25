import {
	Body,
	Controller,
	Get,
	Put,
	Res,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { Secured } from '../auth/guards/secured.guard';
import { SetPasswordDto } from './dtos/set-password.dto';
import { UserService } from './user.service';
import { User } from './decorators/user.decorator';
import type { UserDocument } from './user.schema';
import type { Response } from 'express';
import { generateEntityEtag } from '../common/helpers/etag.helper';
import { UserEtagInterceptor } from '../common/interceptors/etag.interceptor';

@UseGuards(Secured)
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('whoami')
	@UseInterceptors(UserEtagInterceptor)
	protected(
		@User() user: UserDocument,
		@Res({ passthrough: true }) res: Response,
	) {
		res.set('etag', generateEntityEtag(user));
		return { user };
	}
}
