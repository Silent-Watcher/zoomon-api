export enum NOTIFICATION_TYPE {
	// system-triggered
	USER_REGISTERED = 'user:registered',
	USER_DIGEST = 'user:digest',

	COMMENT_REPLIED = 'comment:replied',
	COMMENT_LIKED = 'comment:liked',

	// admin-created
	ADMIN_BROADCAST = 'admin:broadcast',
	ADMIN_DIRECT = 'admin:direct',
}

export enum NOTIFICATION_CHANNEL {
	IN_APP = 'in_app',
	EMAIL = 'email',
	PUSH = 'push',
	SMS = 'sms',
}

export enum NOTIFICATION_STATUS {
	PENDING = 'pending',
	SENT = 'sent',
	DELIVERED = 'delivered',
	READ = 'read',
	FAILED = 'failed',
}

export enum NOTIFICATION_CATEGORY {
	SOCIAL = 'social',
	SYSTEM = 'system',
	MARKETING = 'marketing',
	NEWSLETTER = 'newsletter',
}

export const MAXIMUM_NOTIFICATION_TITLE_LENGTH = 255;
export const MAXIMUM_NOTIFICATION_BODY_LENGTH = 2000;
export type NotificationChannels =
	`${(typeof NOTIFICATION_CHANNEL)[keyof typeof NOTIFICATION_CHANNEL]}`;
