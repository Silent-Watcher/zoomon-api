import {
	NOTIFICATION_CATEGORY,
	NOTIFICATION_TYPE,
} from '../../notification/notification.constant';
import { CommentLikedNotificationData } from '../../notification/notification.interface';

export interface SendNotifJobData {
	userId: string;
	type: NOTIFICATION_TYPE;
	category: NOTIFICATION_CATEGORY;
	[NOTIFICATION_TYPE.COMMENT_LIKED]: CommentLikedNotificationData;
}
