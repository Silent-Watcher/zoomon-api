import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerConfigSchema } from './common/configs/server.config';
import { startHttpServer } from './common/helpers/server.helper';
import { enableSystemLogger } from './common/helpers/logger.helper';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	const config = app.get(ConfigService);
	const systemLogger = enableSystemLogger(app);
	app.setGlobalPrefix('api');
	app.enableVersioning({
		type: VersioningType.MEDIA_TYPE,
		key: 'v=',
		defaultVersion: '1',
	});

	const { host, port } = config.get<ServerConfigSchema>('server', {
		infer: true,
	});

	await startHttpServer(app, { host, logger: systemLogger, port });
}
bootstrap();
