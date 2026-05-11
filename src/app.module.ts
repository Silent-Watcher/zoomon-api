import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';
import { configModuleOptiosn } from './common/configs';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseModuleAsyncOptions } from './common/configs/mongo.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OtpModule } from './otp/otp.module';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { OptimisticLockInterceptor } from './common/interceptors/optimistic-lock.interceptor';
import { EtagInterceptor } from './common/interceptors/etag.interceptor';
import { CacheWithEtagInterceptor } from './common/interceptors/cache-with-etag.interceptor';
import { Secured } from './auth/guards/secured.guard';
import { BlockIfAuthenticatedGuard } from './auth/guards/blockIfAuthenticated.guard';
import { LikeModule } from './like/like.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { UtilModule } from './util/util.module';
import { MongoExceptionsFilter } from './common/filters/mongo-exception.filter';
import { UploadModule } from './upload/upload.module';
import { BullModule } from '@nestjs/bullmq';
import redisConfig from './common/configs/redis.config';
import { ImageQueueModule } from './queues/image-queue/image-queue.module';
import { FileModule } from './file/file.module';
import { SseModule } from './sse/sse.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventModule } from './event/event.module';
import { NotifQueueModule } from './queues/notif-queue/notif-queue.module';
import { NotificationModule } from './notification/notification.module';
import { UserPreferenceModule } from './user-preference/user-preference.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import notificationConfig from './common/configs/notification.config';
import apiConfig from './common/configs/api.config';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';
import { EmailQueueModule } from './queues/email-queue/email-queue.module';

@Module({
	imports: [
		MailerModule.forRootAsync({
			useFactory(
				notifConfig: ConfigType<typeof notificationConfig>,
				apiConf: ConfigType<typeof apiConfig>,
			) {
				return {
					transport: {
						host: notifConfig.smtpHost,
						port: notifConfig.smtpPort,
					},
					defaults: {
						from: `"No Reply" <noreply@${apiConf.appName}.com>`,
					},
					template: {
						dir: notifConfig.emailTemplatesPath,
						adapter: new EjsAdapter(),
						options: {
							strict: true,
						},
					},
				};
			},
			inject: [notificationConfig.KEY, apiConfig.KEY],
		}),
		ConfigModule.forRoot(configModuleOptiosn),
		MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
		RedisModule.forRootAsync({
			useFactory(redisConf: ConfigType<typeof redisConfig>) {
				return {
					url: `redis://${redisConf.host}:${redisConf.port}`,
					type: 'single',
					options: {
						lazyConnect: redisConf.lazyConnect,
						maxRetriesPerRequest: redisConf.maxRetriesPerRequest,
						host: redisConf.host,
						port: redisConf.port,
					},
				};
			},
			inject: [redisConfig.KEY],
		}),
		BullModule.forRootAsync({
			useFactory(redisConf: ConfigType<typeof redisConfig>) {
				return {
					connection: {
						host: redisConf.host,
						port: redisConf.port,
					},
				};
			},
			inject: [redisConfig.KEY],
		}),
		EventEmitterModule.forRoot({
			delimiter: ':',
		}),
		ScheduleModule.forRoot(),
		LoggerModule,
		AuthModule,
		UserModule,
		OtpModule,
		LikeModule,
		ArticleModule,
		CategoryModule,
		CommentModule,
		UtilModule,
		// ClamavModule,
		UploadModule,
		FileModule,
		SseModule,
		EventModule,
		ImageQueueModule,
		EmailQueueModule,
		NotifQueueModule,
		NotificationModule,
		UserPreferenceModule,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_FILTER,
			useClass: MongoExceptionsFilter,
		},
		{
			provide: APP_GUARD,
			useClass: BlockIfAuthenticatedGuard,
		},
		{
			provide: APP_GUARD,
			useClass: Secured,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: EtagInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: OptimisticLockInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: CacheWithEtagInterceptor,
		},
	],
})
export class AppModule {}
