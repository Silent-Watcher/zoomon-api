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
import { ApiUtil } from '../../util/api.util';

@Catch(MongoServerError, MongooseError)
export class MongoExceptionsFilter implements ExceptionFilter {
	constructor(private readonly apiUtil: ApiUtil) {}

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

		const apiVersion = this.apiUtil.getApiVersion(request);

		response.status(status).json({
			message,
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			apiVersion,
		});
	}
}
