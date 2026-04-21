import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class Secured implements CanActivate {
	constructor(private readonly userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<Express.Request>();
		const userId = req.session['userId'];
		if (userId) {
			const user = await this.userService.findById(userId);
			req['user'] = user;
			return true;
		}
		throw new UnauthorizedException();
	}
}
