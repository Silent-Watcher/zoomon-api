import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptiosn } from './common/configs';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseModuleAsyncOptions } from './common/configs/mongo.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OtpRedisModule } from './otp/redis-otp.module';
import { OtpModule } from './otp/otp.module';
@Module({
	imports: [
		LoggerModule,
		ConfigModule.forRoot(configModuleOptiosn),
		MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
		AuthModule,
		UserModule,
		OtpRedisModule,
		OtpModule,
	],
	controllers: [AppController],
	providers: [],
})
export class AppModule {}
