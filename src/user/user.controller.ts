import {
	Body,
	Controller,
	Get,
	Headers,
	Patch,
	Res,
	UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { Secured } from '../auth/guards/secured.guard';
import { USER_CONTEXT_KEY } from '../common/constants/server.constant';
import { CacheWithEtag } from '../common/decorators/cache-with-etag.decorator';
import { Etag } from '../common/decorators/etag.decorator';
import { OptimisticLock } from '../common/decorators/optimistic-lock.decorator';
import { User } from './decorators/user.decorator';
import type { UserDocument } from './user.schema';
import { UserService } from './user.service';

@UseGuards(Secured)
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Etag(USER_CONTEXT_KEY)
	@CacheWithEtag()
	@Get('whoami')
	getCurrentUser(
		@User() user: UserDocument,
		@Res({ passthrough: true }) res: Response,
	) {
		return { user };
	}

	@Etag(USER_CONTEXT_KEY)
	@OptimisticLock()
	@Patch()
	patchCurrentUser(
		@User() user: UserDocument,
		@Body() userPatchDto,
		@Headers('If-Match') ifMatch: string,
	) {
		return {
			user,
			ifMatch,
		};
	}
}
