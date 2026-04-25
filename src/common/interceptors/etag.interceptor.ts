import {
	CallHandler,
	ExecutionContext,
	HttpStatus,
	NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { generateEntityEtag } from '../helpers/etag.helper';

export class UserEtagInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> {
		const req = context.switchToHttp().getRequest<Request>();
		const res = context.switchToHttp().getResponse<Response>();

		const user = req['user'];

		if (user) {
			const inputEtag = req.headers['if-none-match'];
			const currentUserEtag = generateEntityEtag(user);

			if (inputEtag === currentUserEtag) {
				res.sendStatus(HttpStatus.NOT_MODIFIED);
				return new Observable((subscriber) => subscriber.complete());
			}
		}

		return next.handle();
	}
}
