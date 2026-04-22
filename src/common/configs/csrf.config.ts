import { registerAs } from '@nestjs/config';
import type { DoubleCsrfConfigOptions } from 'csrf-csrf';
import type { Request } from 'express';
import z from 'zod';
import { validateSchemaAndReturnData } from '../helpers/validation.helper';

const csrfConfigSchema = z
	.object({
		getSecret: z.function().input().output(z.string().trim().nonoptional()),
	})
	.loose();

export default registerAs('csrf', () => {
	const config: DoubleCsrfConfigOptions = {
		cookieName:
			process.env.APP_ENV === 'production'
				? '__Host-psifi.x-csrf-token'
				: 'psifi.x-csrf-token',
		cookieOptions: {
			sameSite: 'lax',
			path: '/',
			secure: process.env.APP_ENV === 'production',
		},
		size: 64,
		getCsrfTokenFromRequest: (req: Request) => {
			const token = req.headers['x-csrf-token'];
			return Array.isArray(token) ? token[0] : (token as string);
		},
		getSecret: () => process.env?.CSRF_SECRET!,
		getSessionIdentifier: (req: Request) =>
			req.session?.id ?? req?.sessionID,
	};

	return validateSchemaAndReturnData(csrfConfigSchema, config);
});
