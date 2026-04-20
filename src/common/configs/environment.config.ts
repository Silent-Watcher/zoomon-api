import z from 'zod';
import { AppEnvironment } from '../constants/app.constant';
import { fromError } from 'zod-validation-error';
import { registerAs } from '@nestjs/config';

const environmentConfigSchema = z
	.object({
		nodeEnv: z
			.enum(Object.values(AppEnvironment))
			.default(AppEnvironment.Development),
		appEnv: z
			.enum(Object.values(AppEnvironment))
			.default(AppEnvironment.Development),
	})
	.strict();

export type EnvironmentConfigSchema = z.infer<typeof environmentConfigSchema>;

export default registerAs('environment', (): EnvironmentConfigSchema => {
	const config = {
		nodeEnv: process.env?.NODE_ENV,
		appEnv: process.env?.APP_ENV,
	};

	const parseResult = environmentConfigSchema.safeParse(config);

	if (!parseResult.success) {
		throw new Error(
			`Config validation error: ${fromError(parseResult.error).toString()}`,
		);
	}

	return parseResult.data;
});
