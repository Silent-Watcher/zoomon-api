export const IMAGE_QUEUE = 'image';
export const NOTIF_QUEUE = 'notif';

export enum IMAGE_JOBS {
	ARTICLE_IMAGE = 'article-image',
	USER_AVATAR = 'user-avatar',
	USER_BG_IMAGE = 'user-bg-image',
}

export enum NOTIF_JOBS {
	COMMENT_LIKED = 'comment-liked',
	COMMENT_REPLIED = 'comment-replied',
	PUBLIC_ANNOUNCEMENT = 'public-announcement',
}
