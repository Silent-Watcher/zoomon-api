import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import Redis from 'ioredis';
import redisConfig from '../common/configs/redis.config';
import { REDIS } from '../common/constants/redis.constant';
import { OtpService } from './otp.service';

@Module({
	imports: [ConfigModule.forFeature(redisConfig)],
	providers: [
		{
			provide: REDIS,
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
