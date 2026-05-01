import { INestApplication, LoggerService } from '@nestjs/common';
import { LoggerConfigSchema } from '../configs/logger.config';
import { EnvironmentConfigSchema } from '../configs/environment.config';
import { AppLogger } from '../../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { AppEnvironment } from '../constants/app.constant';

export function enableSystemLogger(app: INestApplication): LoggerService {
	const config = app.get(ConfigService);
	const loggerConfig = config.get<LoggerConfigSchema>('logger', {
		infer: true,
	});
	const systemLogger = new AppLogger({
		context: 'HTTPServer',
		...(config.get<EnvironmentConfigSchema>('environment.nodeEnv', {
			infer: true,
		}) == AppEnvironment.Development
			? {
					json: true,
					colors: true,
					compact: true,
					prefix: 'zoomon',
				}
			: {
					json: true,
					colors: false,
					compact: true,
				}),
		logLevels: [loggerConfig.levels],
	});
	app.useLogger(systemLogger);
	return systemLogger;
}
