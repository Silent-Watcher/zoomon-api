import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';
import { versionFieldMiddleware } from '../common/helpers/mongo.helper';
import { CommentNotificationService } from './social/comment-notification.service';
import { NotificationService } from './notification.service';
import { SseModule } from '../sse/sse.module';
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
	providers: [CommentNotificationService, NotificationService],
	exports: [NotificationService],
})
export class NotificationModule {}
