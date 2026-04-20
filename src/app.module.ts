import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import serverConfig from './common/configs/server.config';
import environmentConfig from './common/configs/environment.config';
import loggerConfig from './common/configs/logger.config';

@Module({
	imports: [
		LoggerModule,
		ConfigModule.forRoot({
			ignoreEnvFile: true,
			skipProcessEnv: true,
			isGlobal: true,
			load: [environmentConfig, serverConfig, loggerConfig],
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
