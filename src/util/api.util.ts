import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class ApiUtil {
	getApiVersion(req: Request): string {
		const header = req.headers['accept'];
		const versionExpression = header?.split(';')[1];
		let version = versionExpression?.split('=')[1];
		if (!version) version = '1';
		return version;
	}
}
