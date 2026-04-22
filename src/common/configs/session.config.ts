import { registerAs } from '@nestjs/config';
import session from 'express-session';
import z from 'zod';
import { SESSION_MAX_AGE_IN_MS } from '../constants/app.constant';
import { validateSchemaAndReturnData } from '../helpers/validation.helper';
import MongoStore from 'connect-mongo';

const sessionConfigSchema = z.object({
	secret: z.string().trim().nonoptional(),
});

export default registerAs('session', (): session.SessionOptions => {
	const config: session.SessionOptions = {
		secret: process.env?.SESSION_SECRET!,
		name:
			process.env?.nodeEnv === 'production'
				? '__secure-connect.sid'
				: 'connect.sid',
		resave: false,
		saveUninitialized: true,
		store: new MongoStore({
			mongoUrl: process.env.MONGO_URI,
			dbName: process.env.MONGO_DB,
			autoRemove: 'native',
			timestamps: true,
			collectionName: 'sessions',
		}),
		cookie: {
			httpOnly: true,
			maxAge: SESSION_MAX_AGE_IN_MS,
			sameSite: 'lax',
			path: '/',
			secure: process.env?.nodeEnv === 'production',
		},
	};

	return validateSchemaAndReturnData(sessionConfigSchema, config);
});
