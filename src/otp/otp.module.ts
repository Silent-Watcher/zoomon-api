import { ConfigModule, ConfigType } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import redisConfig from '../common/configs/redis.config';
import Redis from 'ioredis';
import { OTP_REDIS } from '../common/constants/otp.constant';

@Module({
	imports: [ConfigModule.forFeature(redisConfig)],
	providers: [
		{
			provide: OTP_REDIS,
			useFactory(redisConf: ConfigType<typeof redisConfig>) {
				return new Redis({
					host: redisConf.host,
					port: redisConf.port,
					lazyConnect: redisConf.lazyConnect,
					maxRetriesPerRequest: redisConf.maxRetriesPerRequest,
				});
			},
			inject: [redisConfig.KEY],
		},
		OtpService,
	],
	exports: [OtpService],
})
export class OtpModule {}
