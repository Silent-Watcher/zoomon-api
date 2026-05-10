import { Injectable } from '@nestjs/common';
import {
	NotificationChannelPayload,
	NotificationChannelService,
} from '../../interfaces/notification-channels.interface';

@Injectable()
export class FakeEmailChannel implements NotificationChannelService {
	send(
		recipient: string,
		payload: NotificationChannelPayload,
	): Promise<any | void> | void {
		console.log(
			`[FAKE EMAIL] To: ${recipient} , Message: ${payload.message}`,
		);
	}
}
