import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BLOCK_IF_AUTHENTICATED_KEY } from '../../common/decorators/block-if-authenticated.decorator';

@Injectable()
export class BlockIfAuthenticatedGuard implements CanActivate {
	constructor(private readonly reflect: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest<Express.Request>();

		console.log('this.reflect: ', this.reflect);
		const enabled = this.reflect.getAllAndOverride(
			BLOCK_IF_AUTHENTICATED_KEY,
			[context.getHandler(), context.getClass()],
		);
		console.log('enabled: ', enabled);

		if (!enabled) return true;

		if (req.session['userId']) {
			throw new ForbiddenException(
				'forbidden action for authenticated user',
			);
		}
		return true;
	}
}
