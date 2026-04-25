import { NextFunction, Request, Response } from 'express';
import { generateEtag } from '../helpers/etag.helper';

export function etag(_req: Request, res: Response, next: NextFunction) {
	const originalRes = res.json.bind(res);

	res.json = function (data) {
		if (!res.getHeader('etag') && data && typeof data === 'object') {
			const etag = generateEtag(data);
			res.set('etag', etag);
		}
		return originalRes(data);
	};

	next();
}
