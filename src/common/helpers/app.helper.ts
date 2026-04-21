import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import session from 'express-session';

export function registerGlobalMiddlewares(app: INestApplication): void {
	const config = app.get(ConfigService);
	const sessionOptions = config.get<session.SessionOptions>('session');

	app.use(cookieParser());
	app.use(session(sessionOptions));
}
