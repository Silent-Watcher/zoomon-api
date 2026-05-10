import { registerAs } from '@nestjs/config';
import z from 'zod';
import { EMAIL_CHANNEL_PROVIDER } from '../../notification/notification.constant';
import { validateSchemaAndReturnData } from '../helpers/validation.helper';

const notificationConfigSchema = z
	.object({
		emailProvider: z
			.enum(EMAIL_CHANNEL_PROVIDER)
			.default(EMAIL_CHANNEL_PROVIDER.FAKE),
	})
	.strict();

export type NotificationConfig = z.infer<typeof notificationConfigSchema>;

export default registerAs('notification', (): NotificationConfig => {
	const config = {
		emailProvider: process.env?.EMAIL_PROVIDER!,
	};

	return validateSchemaAndReturnData(notificationConfigSchema, config);
});
