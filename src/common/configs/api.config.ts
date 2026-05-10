import { registerAs } from '@nestjs/config';
import z from 'zod';
import { validateSchemaAndReturnData } from '../helpers/validation.helper';

const apiConfigSchema = z
	.object({
		requestTimeoutMs: z.coerce.number().nonnegative().gt(0),
		cursorSecret: z.string().trim().nonoptional(),
	})
	.loose();

export type ApiConfig = {
	globalPrefix: string;
	appName: string;
	requestTimeoutMs: number;
	cursorSecret: string;
	supportEmail: string;
};

export default registerAs('api', (): ApiConfig => {
	const config = {
		globalPrefix: 'api',
		appName: 'zoomon',
		requestTimeoutMs: process.env.REQUEST_TIMEOUT_MS,
		cursorSecret: process.env.CURSOR_SECRET,
		supportEmail: 'support@zoomon.com',
	};
	return validateSchemaAndReturnData(apiConfigSchema, config);
});
