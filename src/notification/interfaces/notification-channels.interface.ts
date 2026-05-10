export interface NotificationChannelPayload {
	message: string;
}

export interface NotificationChannelService {
	send(
		recipient: string,
		payload: NotificationChannelPayload,
	): Promise<any | void> | void;
}
