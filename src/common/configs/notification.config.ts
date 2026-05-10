import { registerAs } from '@nestjs/config';
import z from 'zod';
import { EMAIL_CHANNEL_PROVIDER } from '../../notification/notification.constant';
import { validateSchemaAndReturnData } from '../helpers/validation.helper';
import { existsSync } from 'node:fs';
import { EMAIL_TEMPLATES_PATH } from '../constants/app.constant';

const notificationConfigSchema = z
	.object({
		emailProvider: z
			.enum(EMAIL_CHANNEL_PROVIDER)
			.default(EMAIL_CHANNEL_PROVIDER.FAKE)
			.optional(),
		smtpHost: z.string().nonempty().optional(),
		smtpPort: z.coerce.number().optional(),
		emailTemplatesPath: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data?.emailProvider === EMAIL_CHANNEL_PROVIDER.SMTP) {
			if (!data.smtpHost) {
				ctx.addIssue({
					code: 'custom',
					path: ['smtpHost'],
					message: 'smtpHost is required when emailProvider is SMTP',
				});
			}

			if (!data.smtpPort) {
				ctx.addIssue({
					code: 'custom',
					path: ['smtpPort'],
					message: 'smtpPort is required when emailProvider is SMTP',
				});
			}

			if (!data.emailTemplatesPath) {
				ctx.addIssue({
					code: 'custom',
					path: ['emailTemplatesPath'],
					message:
						'emailTemplatesPath is required when emailProvider is SMTP',
				});
			}

			if (!existsSync(EMAIL_TEMPLATES_PATH)) {
				ctx.addIssue({
					code: 'custom',
					path: ['emailTemplatesPath'],
					message: 'emailTemplatesPath path not found!',
				});
			}
		}
	});

export type NotificationConfig = z.infer<typeof notificationConfigSchema>;

export default registerAs('notification', (): NotificationConfig => {
	const config = {
		emailProvider: process.env?.EMAIL_PROVIDER!,
		smtpHost: process.env?.SMTP_HOST,
		smtpPort: process.env?.SMTP_PORT,
		emailTemplatesPath: EMAIL_TEMPLATES_PATH,
	};

	return validateSchemaAndReturnData(notificationConfigSchema, config);
});
