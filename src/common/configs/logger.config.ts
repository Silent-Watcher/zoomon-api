import { LOG_LEVELS } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import z from 'zod';
import { fromError } from 'zod-validation-error';

const loggerConfigSchema = z
	.object({
		levels: z.enum(LOG_LEVELS).default('log'),
	})
	.strict();

export type LoggerConfigSchema = z.infer<typeof loggerConfigSchema>;

export default registerAs('logger', () => {
	const config = {
		levels: process.env.LOG_LEVEL,
	};

	const parseResult = loggerConfigSchema.safeParse(config);

	if (!parseResult.success) {
		throw new Error(
			`Config validation error: ${fromError(parseResult.error).toString()}`,
		);
	}

	return parseResult.data;
});
