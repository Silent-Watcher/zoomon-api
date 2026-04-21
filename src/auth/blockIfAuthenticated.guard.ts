import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from '@nestjs/common';

export class BlockIfAuthenticated implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest<Express.Request>();

		if (req.session['userId']) {
			throw new ForbiddenException(
				'forbidden action for authenticated user',
			);
		}
		return true;
	}
}
