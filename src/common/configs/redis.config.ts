import { registerAs } from '@nestjs/config';
import z from 'zod';
import { validateSchemaAndReturnData } from '../helpers/validation.helper';
import { RedisOptions } from 'ioredis';

const redisConfigSchema = z.object({
	host: z.string().default('127.0.0.1'),
	port: z.coerce.number().default(6379),
});

export type RedisConfig = z.infer<typeof redisConfigSchema>;

export default registerAs('redis', (): RedisOptions => {
	const config: RedisOptions = {
		host: process.env.REDIS_HOST!,
		port: Number(process.env.REDIS_PORT),
		lazyConnect: false,
		maxRetriesPerRequest: null,
		enableReadyCheck: false,
	};

	return validateSchemaAndReturnData(redisConfigSchema, config);
});
