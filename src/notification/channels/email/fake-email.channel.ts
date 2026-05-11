import { Injectable } from '@nestjs/common';
import { NotificationChannelService } from '../../interfaces/notification-channels.interface';

@Injectable()
export class FakeEmailChannel implements NotificationChannelService<any> {
	async send(recipient: string, payload: any): Promise<any> {
		console.log(
			`[FAKE EMAIL] To: ${recipient} , Message: ${payload.message}`,
		);
	}
}
