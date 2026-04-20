import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptiosn } from './common/configs';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseModuleAsyncOptions } from './common/configs/mongo.config';

@Module({
	imports: [
		LoggerModule,
		ConfigModule.forRoot(configModuleOptiosn),
		MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
