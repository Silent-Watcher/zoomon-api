import { ConfigModuleOptions } from '@nestjs/config';
import environmentConfig from './environment.config';
import serverConfig from './server.config';
import loggerConfig from './logger.config';
import mongoConfig from './mongo.config';
import apiConfig from './api.config';
import sessionConfig from './session.config';
import redisConfig from './redis.config';
import csrfConfig from './csrf.config';

export const configModuleOptiosn: ConfigModuleOptions = {
	ignoreEnvFile: true,
	skipProcessEnv: true,
	isGlobal: true,
	cache: true,
	load: [
		environmentConfig,
		serverConfig,
		loggerConfig,
		mongoConfig,
		apiConfig,
		sessionConfig,
		redisConfig,
		csrfConfig,
	],
};
