import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerConfigSchema } from './common/configs/server.config';
import { startHttpServer } from './common/helpers/server.helper';
import { enableSystemLogger } from './common/helpers/logger.helper';
import session from 'express-session';
import { ApiConfig } from './common/configs/api.config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	const config = app.get(ConfigService);
	const apiConfig = config.get<ApiConfig>('api', { infer: true });

	const systemLogger = enableSystemLogger(app);

	app.setGlobalPrefix(apiConfig.globalPrefix);
	app.enableVersioning({
		type: VersioningType.MEDIA_TYPE,
		key: 'v=',
		defaultVersion: '1',
	});

	const { host, port } = config.get<ServerConfigSchema>('server', {
		infer: true,
	});

	const sessionOptions = config.get<session.SessionOptions>('session');

	app.use(session(sessionOptions));

	await startHttpServer(app, { host, logger: systemLogger, port });
}
bootstrap();
