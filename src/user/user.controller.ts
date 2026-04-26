import {
	Body,
	Controller,
	Get,
	Header,
	Headers,
	Patch,
	Res,
	UseGuards,
	UsePipes,
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
@Etag(USER_CONTEXT_KEY)
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@CacheWithEtag()
	@Get('whoami')
	getCurrentUser(
		@User() user: UserDocument,
		@Res({ passthrough: true }) res: Response,
	) {
		return { user };
	}

	@OptimisticLock()
	@Patch()
	patchCurrentUser(@User('_id') userId: string, @Body() userPatchDto: any) {
		return this.userService.patchCurrentUser(
			userId.toString(),
			userPatchDto,
		);
	}
}
