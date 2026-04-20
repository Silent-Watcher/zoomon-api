import { registerAs } from '@nestjs/config';
import z from 'zod';
import { fromError } from 'zod-validation-error';

const serverConfigSchema = z
	.object({
		host: z.string().nonoptional(),
		port: z.coerce.number().min(1024).max(49151).default(4000),
	})
	.strict();

export type ServerConfigSchema = z.infer<typeof serverConfigSchema>;

export default registerAs('server', (): ServerConfigSchema => {
	const config = {
		host: process.env.SERVER_HOST,
		port: process.env.SERVER_PORT,
	};

	const parseResult = serverConfigSchema.safeParse(config);

	if (!parseResult.success) {
		throw new Error(
			`Config validation error: ${fromError(parseResult.error).toString()}`,
		);
	}

	return parseResult.data;
});
