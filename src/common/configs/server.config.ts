import { registerAs } from '@nestjs/config';
import z from 'zod';
import { validateSchemaAndReturnData } from '../helpers/validation.helper';

const serverConfigSchema = z.object({
	host: z.string().nonoptional(),
	port: z.coerce.number().min(1024).max(49151).default(4000),
});

export type ServerConfigSchema = z.infer<typeof serverConfigSchema>;

export default registerAs('server', (): ServerConfigSchema => {
	const config = {
		host: process.env?.SERVER_HOST!,
		port: process.env?.SERVER_PORT!,
	};

	return validateSchemaAndReturnData(serverConfigSchema, config);
});
