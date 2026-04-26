import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { Injectable, NestInterceptor } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import {
	DATA_CONTEXT_KEY,
	ETAG_CONTEXT_KEY,
} from '../constants/server.constant';
import { ETAG_METADATA_KEY, EtagConfig } from '../decorators/etag.decorator';
import { generateEntityEtag } from '../helpers/etag.helper';

@Injectable()
export class EtagInterceptor implements NestInterceptor {
	constructor(
		private readonly reflector: Reflector,
		private readonly moduleRef: ModuleRef,
	) {}

	async intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Promise<Observable<any>> {
		const config = this.reflector.get<EtagConfig>(
			ETAG_METADATA_KEY,
			context.getHandler(),
		);

		console.log('config: ', config);
		console.log('!config: ', !config);
		if (!config) {
			return next.handle();
		}

		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();
		const { dataKey, paramName, serviceToken } = config;
		let resource: any;

		if (dataKey) {
			resource = request[DATA_CONTEXT_KEY][dataKey];
		} else if (serviceToken && paramName) {
			const id = request.params[paramName as string];
			const service = this.moduleRef.get(serviceToken, { strict: false });
			resource = await service.findById(id);
		}

		if (resource) {
			const etag = generateEntityEtag(resource);
			request[ETAG_CONTEXT_KEY] = etag;

			return next.handle().pipe(
				tap(() => {
					response.set('etag', etag);
				}),
			);
		}

		return next.handle();
	}
}
