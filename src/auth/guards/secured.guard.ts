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
import { Reflector } from '@nestjs/core';
import { PUBLIC_METADATA_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class Secured implements CanActivate {
	constructor(
		private readonly userService: UserService,
		private readonly reflect: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<Request>();
		const userId = req.session['userId'];

		const isPublic = this.reflect.getAllAndOverride<boolean>(
			PUBLIC_METADATA_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (isPublic) return true;

		if (userId) {
			const user = await this.userService.findById(
				userId,
				{ __v: 0, version: 0 },
				{ lean: false },
			);

			if (!user) throw new NotFoundException('User not found');

			req[DATA_CONTEXT_KEY] = {};
			req[DATA_CONTEXT_KEY][USER_CONTEXT_KEY] = user;
			return true;
		}
		throw new UnauthorizedException();
	}
}
