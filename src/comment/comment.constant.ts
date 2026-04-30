export const MINIMUM_COMMENT_CONTENT_LENGTH = 1;
export const MAXIMUM_COMMENT_CONTENT_LENGTH = 1000;
export const MAXIMUM_COMMENTS_DEPTH = 5;

export enum COMMENT_STATUS {
	ACTIVE = 'active',
	PENDING = 'pending',
	HIDDEN = 'hidden',
}

export type CommentStatus =
	`${(typeof COMMENT_STATUS)[keyof typeof COMMENT_STATUS]}`;

export const COMMENT_STATUS_LIST: CommentStatus[] =
	Object.values(COMMENT_STATUS);
