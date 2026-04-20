import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import redisConfig from '../common/configs/redis.config';
import { ConfigModule } from '@nestjs/config';
import { ConfigType } from '@nestjs/config';

export const OTP_REDIS = 'OTP_REDIS';

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
	],
	exports: [OTP_REDIS],
})
export class OtpRedisModule {}
