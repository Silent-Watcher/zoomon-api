import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { MONGODB_ERROR_CODES } from '../constants/mongo.constant';
import { extractMongoDuplicateKeyValueFromError } from '../helpers/mongo.helper';
import { MongooseError } from 'mongoose';

@Catch(MongoServerError, MongooseError)
export class MongoExceptionsFilter implements ExceptionFilter {
	catch(exception: MongoServerError | MongooseError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const request = ctx.getRequest<Request>();
		const response = ctx.getResponse<Response>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Database error occurred';

		const errorCode = (exception as any).code;

		if (MONGODB_ERROR_CODES.DUPLICATE_KEY === errorCode) {
			status = HttpStatus.CONFLICT;

			const duplicateKey = extractMongoDuplicateKeyValueFromError(
				exception.message,
			);
			message = `Duplicate key error: ${duplicateKey}`;
		}

		const apiVersion = this.getApiVersion(request);

		response.status(status).json({
			message,
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			apiVersion,
		});
	}

	// todo: MOVE THIS into api util service!
	private getApiVersion(req: Request): string {
		const header = req.headers['accept'];
		const versionExpression = header?.split(';')[1];
		let version = versionExpression?.split('=')[1];
		if (!version) version = '1';
		return version;
	}
}
