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
		resave: false,
		saveUninitialized: false,
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
			secure: process.env?.nodeEnv === 'production',
		},
	};

	return validateSchemaAndReturnData(sessionConfigSchema, config);
});
