import {
	CallHandler,
	ExecutionContext,
	HttpStatus,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { CACHE_WITH_ETAG_KEY } from '../constants/decorator.constant';
import { ETAG_CONTEXT_KEY } from '../constants/server.constant';
import { Request, Response } from 'express';

@Injectable()
export class CacheWithEtagInterceptor implements NestInterceptor {
	constructor(private readonly reflector: Reflector) {}

	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> | Promise<Observable<any>> {
		const enabled = this.reflector.get<boolean>(
			CACHE_WITH_ETAG_KEY,
			context.getHandler(),
		);

		if (!enabled) return next.handle();

		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();
		const etag = request[ETAG_CONTEXT_KEY];

		const ifNoneMatch = request.headers['if-none-match'];

		if (etag && ifNoneMatch === etag) {
			response.status(HttpStatus.NOT_MODIFIED).send();
			return new Observable((subscriber) => subscriber.complete());
		}

		return next.handle();
	}
}
