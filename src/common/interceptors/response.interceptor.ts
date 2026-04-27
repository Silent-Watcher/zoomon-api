import {
	CallHandler,
	ExecutionContext,
	Inject,
	Injectable,
	NestInterceptor,
	RequestTimeoutException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import {
	catchError,
	map,
	Observable,
	throwError,
	timeout,
	TimeoutError,
} from 'rxjs';
import apiConfig from '../configs/api.config';
import { Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import { ApiResponse } from '../interfaces/server.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
	constructor(
		@Inject(apiConfig.KEY)
		private readonly apiConf: ConfigType<typeof apiConfig>,
	) {}

	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> | Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();

		const reqId = uuidV4();
		const apiVersion = this.getApiVersion(request);

		const startTime = Date.now();

		return next.handle().pipe(
			timeout(this.apiConf.requestTimeoutMs),
			map((data) => {
				const duration = Date.now() - startTime;

				if (data.user.password) data.user.password = undefined;

				const transformedResponse: Partial<ApiResponse> = {
					statusCode: response.statusCode,
					data: data?.message
						? this.extractDataFromResponse(data)
						: data,
					timestamp: new Date().toISOString(),
					apiVersion,
					path: request.url,
					reqId,
					duration: `${duration}ms`,
				};

				if (data?.message) transformedResponse.message = data.message;

				return transformedResponse;
			}),
			catchError((error) => {
				const duration = Date.now() - startTime;

				if (error instanceof TimeoutError) {
					return throwError(
						() =>
							new RequestTimeoutException({
								message: 'Request timeout',
								reqId,
								duration: `${duration}ms`,
							}),
					);
				}

				error.reqId = reqId;
				error.duration = `${duration}ms`;

				return throwError(() => error);
			}),
		);
	}

	private getApiVersion(req: Request): string {
		const header = req.headers['accept'];
		const versionExpression = header?.split(';')[1];
		let version = versionExpression?.split('=')[1];
		if (!version) version = '1';
		return version;
	}

	private extractDataFromResponse(
		responseData: Record<string | number | symbol, unknown>,
	) {
		const { message, ...data } = responseData;
		return data;
	}
}
