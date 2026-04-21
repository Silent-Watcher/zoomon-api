import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { Secured } from '../auth/guards/secured.guard';
import { SetPasswordDto } from './dtos/set-password.dto';
import { UserService } from './user.service';
import { User } from './decorators/user.decorator';
import { User as IUser } from './user.schema';

@UseGuards(Secured)
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('whoami')
	protected(@User() user: IUser) {
		return user;
	}

	@Put('passwords')
	async setPassword(
		@Body() setPasswordDto: SetPasswordDto,
		@User('_id') userId: string,
	) {
		const { password } = setPasswordDto;
		const result = await this.userService.setPassword(password, userId);
		return result;
	}
}
