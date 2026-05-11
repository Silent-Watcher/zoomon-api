import { Injectable } from '@nestjs/common';
import {
	EmailChannelServicePayload,
	NotificationChannelService,
} from '../../interfaces/notification-channels.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SmtpEmailChannel implements NotificationChannelService<EmailChannelServicePayload> {
	constructor(private readonly mailerService: MailerService) {}

	async send(
		recipient: string,
		subject: string,
		payload: EmailChannelServicePayload,
	) {
		const { context, template } = payload;
		const info = await this.mailerService.sendMail({
			to: recipient,
			subject,
			template,
			context,
		});
		return info;
	}
}
