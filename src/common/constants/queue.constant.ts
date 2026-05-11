export const IMAGE_QUEUE = 'image';
export const NOTIF_QUEUE = 'notif';
export const EMAIL_QUEUE = 'email';

export enum IMAGE_JOBS {
	ARTICLE_IMAGE = 'article-image',
	USER_AVATAR = 'user-avatar',
	USER_BG_IMAGE = 'user-bg-image',
}

export enum EMAIL_JOBS {
	WELCOME_EMAIL = 'welcome-email',
	OTP_EMAIL = 'otp_email',
}
