import { ConfigModuleOptions } from '@nestjs/config';
import environmentConfig from './environment.config';
import serverConfig from './server.config';
import loggerConfig from './logger.config';
import mongoConfig from './mongo.config';

export const configModuleOptiosn: ConfigModuleOptions = {
	ignoreEnvFile: true,
	skipProcessEnv: true,
	isGlobal: true,
	load: [environmentConfig, serverConfig, loggerConfig, mongoConfig],
};
