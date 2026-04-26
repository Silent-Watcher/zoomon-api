import { Body, Controller, Get, Patch } from '@nestjs/common';
import { USER_CONTEXT_KEY } from '../common/constants/server.constant';
import { CacheWithEtag } from '../common/decorators/cache-with-etag.decorator';
import { Etag } from '../common/decorators/etag.decorator';
import { OptimisticLock } from '../common/decorators/optimistic-lock.decorator';
import { User } from './decorators/user.decorator';
import type { UserDocument } from './user.schema';
import { UserService } from './user.service';
import { SetPasswordDto } from './dtos/set-password.dto';

@Etag(USER_CONTEXT_KEY)
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@CacheWithEtag()
	@Get('whoami')
	getCurrentUser(@User() user: UserDocument) {
		return { user };
	}

	@OptimisticLock()
	@Patch()
	patchCurrentUser(@User() user: UserDocument, @Body() userPatchDto: any) {
		return this.userService.patchCurrentUser(user, userPatchDto);
	}

	@OptimisticLock()
	@Patch('passwords')
	updateOrSetPassword(
		@User() user: UserDocument,
		@Body() passwordDto: SetPasswordDto,
	) {
		const { password: newPassword, oldPassword } = passwordDto;
		return this.userService.setPassword(newPassword, user, oldPassword);
	}
}
