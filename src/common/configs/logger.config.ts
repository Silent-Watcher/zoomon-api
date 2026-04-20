import { LOG_LEVELS } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import z from 'zod';
import { validateSchemaAndReturnData } from '../helpers/validation.helper';

const loggerConfigSchema = z.object({
	levels: z.enum(LOG_LEVELS).default('log'),
});

export type LoggerConfigSchema = z.infer<typeof loggerConfigSchema>;

export default registerAs('logger', (): LoggerConfigSchema => {
	const config = {
		levels: process.env.LOG_LEVEL!,
	};

	return validateSchemaAndReturnData(loggerConfigSchema, config);
});
