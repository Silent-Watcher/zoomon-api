import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import type { Request } from 'express';

@Injectable()
export class Secured implements CanActivate {
	constructor(private readonly userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<Request>();
		const userId = req.session['userId'];

		if (userId) {
			const user = await this.userService.findById(userId);

			if (!user) throw new NotFoundException('User not found');

			req['user'] = user;
			return true;
		}
		throw new UnauthorizedException();
	}
}
