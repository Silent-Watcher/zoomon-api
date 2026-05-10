import { ConfigType } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';
import { versionFieldMiddleware } from '../common/helpers/mongo.helper';
import { CommentNotificationService } from './social/comment-notification.service';
import { NotificationService } from './notification.service';
import { SseModule } from '../sse/sse.module';
import { NotificationController } from './notification.controller';
import { EMAIL_CHANNEL, EMAIL_CHANNEL_PROVIDER } from './notification.constant';
import notificationConfig from '../common/configs/notification.config';
import { FakeEmailChannel } from './channels/email/fake-email.channel';
import { SmtpEmailChannel } from './channels/email/smtp-email.channel';
import { MailerService } from '@nestjs-modules/mailer';
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
	controllers: [NotificationController],
	providers: [
		CommentNotificationService,
		NotificationService,
		{
			provide: EMAIL_CHANNEL,
			useFactory(
				notificationConf: ConfigType<typeof notificationConfig>,
				mailerService: MailerService,
			) {
				console.log(
					'notificationConf.emailProvider: ',
					notificationConf.emailProvider,
				);
				switch (notificationConf.emailProvider) {
					case EMAIL_CHANNEL_PROVIDER.FAKE:
						return new FakeEmailChannel();
					case EMAIL_CHANNEL_PROVIDER.SMTP:
						return new SmtpEmailChannel(mailerService);
					default:
						throw new Error('Unknown Email Channel provider');
				}
			},
			inject: [notificationConfig.KEY, MailerService],
		},
	],
	exports: [NotificationService],
})
export class NotificationModule {}
