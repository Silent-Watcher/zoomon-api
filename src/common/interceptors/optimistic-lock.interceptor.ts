import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
	PreconditionFailedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { OPTIMISTIC_LOCK_KEY } from '../constants/decorator.constant';
import type { Request, Response } from 'express';
import { ETAG_CONTEXT_KEY } from '../constants/server.constant';

@Injectable()
export class OptimisticLockInterceptor implements NestInterceptor {
	constructor(private reflector: Reflector) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const enabled = this.reflector.get<boolean>(
			OPTIMISTIC_LOCK_KEY,
			context.getHandler(),
		);

		if (!enabled) {
			return next.handle();
		}

		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();
		const etag = request[ETAG_CONTEXT_KEY];
		const ifMatch = request.headers['if-match'];

		if (!ifMatch) {
			throw new PreconditionFailedException(
				'If-Match header is required',
			);
		}

		if (etag && ifMatch !== etag) {
			throw new PreconditionFailedException(
				'Resource has been modified by another request',
			);
		}

		return next.handle().pipe(
			tap(() => {
				response.set('etag', etag);
			}),
		);
	}
}
