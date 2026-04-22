import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import { doubleCsrf, DoubleCsrfConfigOptions } from 'csrf-csrf';

export function registerGlobalMiddlewares(app: INestApplication): void {
	const config = app.get(ConfigService);
	const sessionOptions = config.get<session.SessionOptions>('session');
	const csrfOptions = config.get<DoubleCsrfConfigOptions>('csrf', {
		infer: true,
	});
	const { doubleCsrfProtection } = doubleCsrf(csrfOptions);

	//! DO NOT CHANGE THE ORDER OF THESE LINES!
	app.use(helmet());
	app.use(cookieParser());
	app.use(session(sessionOptions));
	app.use(doubleCsrfProtection);
}
