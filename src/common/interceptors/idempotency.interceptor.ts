import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IDEMPOTENT_METATDATA_KEY } from '../decorators/idempotent.decorator';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
	constructor(private readonly reflector: Reflector) {}

	async intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Promise<Observable<any>> {
		// recieve user header Idempotency-Key
		// check if exists!

		const enabled = this.reflector.getAllAndOverride(
			IDEMPOTENT_METATDATA_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!enabled) {
			return next.handle();
		}

		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();

		console.log('processing idempotency...');

		return next.handle();
	}
}
