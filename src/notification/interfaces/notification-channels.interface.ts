import { EmailTemplates } from '../notification.constant';

export interface NotificationChannelService<P> {
	send(recipient: string, subject: string, payload: P): Promise<any>;
}
export interface EmailChannelServicePayload {
	template?: EmailTemplates;
	message?: string;
	context: Record<string, unknown>;
}
