import { EMAIL_TEMPLATES } from '../../notification/notification.constant';

export interface WELCOME_EMAIL_JOB_DATA {
	recipient: string;
	subject: string;
	payload: {
		template: EMAIL_TEMPLATES;
		context: Record<string, unknown>;
	};
}
