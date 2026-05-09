import { ConfigType } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';
import { versionFieldMiddleware } from '../common/helpers/mongo.helper';
import { CommentNotificationService } from './social/comment-notification.service';
import { NotificationService } from './notification.service';
import { SseModule } from '../sse/sse.module';
import { REDIS } from '../common/constants/redis.constant';
import Redis from 'ioredis';
import redisConfig from '../common/configs/redis.config';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Notification.name,
				useFactory() {
					const schema = NotificationSchema;
					versionFieldMiddleware(schema);
					return schema;
				},
			},
		]),
		SseModule,
	],
	providers: [
		CommentNotificationService,
		NotificationService,
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
	],
	exports: [NotificationService],
})
export class NotificationModule {}
