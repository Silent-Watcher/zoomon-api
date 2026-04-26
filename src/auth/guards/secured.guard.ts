import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import type { Request } from 'express';
import {
	DATA_CONTEXT_KEY,
	USER_CONTEXT_KEY,
} from '../../common/constants/server.constant';

@Injectable()
export class Secured implements CanActivate {
	constructor(private readonly userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<Request>();
		const userId = req.session['userId'];

		if (userId) {
			const user = await this.userService.findById(
				userId,
				{ __v: 0 },
				false,
			);

			if (!user) throw new NotFoundException('User not found');

			req[DATA_CONTEXT_KEY] = {};
			req[DATA_CONTEXT_KEY][USER_CONTEXT_KEY] = user;
			return true;
		}
		throw new UnauthorizedException();
	}
}
