import { Injectable } from '@nestjs/common';
import {
	NotificationChannelPayload,
	NotificationChannelService,
} from '../../interfaces/notification-channels.interface';

@Injectable()
export class SmtpEmailChannel implements NotificationChannelService {
	send(
		recipient: string,
		payload: NotificationChannelPayload,
	): Promise<any | void> | void {
		throw new Error('Method not implemented.');
	}
}
