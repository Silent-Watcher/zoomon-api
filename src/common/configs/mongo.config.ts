import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import z from 'zod';
import { fromError } from 'zod-validation-error';
import { MONGO_SERVER_SELECTION_TIMEOUT_MS } from '../constants/mongo.constant';

const mongodbConfigSchema = z
	.object({
		uri: z.string().trim().nonoptional(),
		dbName: z.string().toLowerCase().min(1).default('app'),
		user: z.string().trim().min(1).optional(),
		pass: z.string().trim().min(1).optional(),
		authSource: z.string().trim().toLowerCase().min(1).default('admin'),
	})
	.strict();

export type MongodbConfig = z.infer<typeof mongodbConfigSchema>;

export default registerAs('mongodb', () => {
	const config = {
		uri: process.env.MONGO_URI,
		dbName: process.env.MONGO_DB || 'app',
		user: process.env.MONGO_USER || undefined,
		pass: process.env.MONGO_PASS || undefined,
		authSource: process.env.MONGO_AUTH_SOURCE || 'admin',
	};

	const parseResult = mongodbConfigSchema.safeParse(config);

	if (!parseResult.success) {
		throw new Error(
			`Config validation error: ${fromError(parseResult.error).toString()}`,
		);
	}

	return parseResult.data;
});

export const mongooseModuleAsyncOptions: MongooseModuleAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (config: ConfigService) => {
		const mongoConfig = config.get<MongodbConfig>('mongodb');

		return {
			uri: mongoConfig?.uri,
			dbName: mongoConfig?.dbName,
			user: mongoConfig?.user || undefined,
			pass: mongoConfig?.pass || undefined,
			authSource: mongoConfig?.authSource,
			serverSelectionTimeoutMS: MONGO_SERVER_SELECTION_TIMEOUT_MS,
		};
	},
};
