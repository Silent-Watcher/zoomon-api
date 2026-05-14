import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import {
	DATA_CONTEXT_KEY,
	USER_CONTEXT_KEY,
} from '../common/constants/server.constant';
import stringify from 'fast-json-stable-stringify';
import { createHash } from 'node:crypto';
@Injectable()
export class ApiUtil {
	constructor() {}

	getApiVersion(req: Request): string {
		const header = req.headers['accept'];
		const versionExpression = header?.split(';')[1];
		let version = versionExpression?.split('=')[1];
		if (!version) version = '1';
		return version;
	}

	getEntityLocationHeaderValue(entityId: string, req: Request): string {
		return `${req.host}/${req.url}/${entityId}`;
	}

	createRequestSignature(req: Request): string {
		const { method, url, query, params, body } = req;

		const obj = {
			apiVersion: this.getApiVersion(req),
			currentUser: req[DATA_CONTEXT_KEY][USER_CONTEXT_KEY],
			method,
			url,
			query,
			params,
			body,
		};

		return createHash('md5').update(stringify(obj)).digest('hex');
	}
}
