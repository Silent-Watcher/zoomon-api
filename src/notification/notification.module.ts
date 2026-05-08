import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';
import { versionFieldMiddleware } from '../common/helpers/mongo.helper';

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
	],
	providers: [NotificationService],
})
export class NotificationModule {}
