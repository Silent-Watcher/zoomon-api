import { CommentLikedNotificationData } from '../../notification/interfaces/notification.interface';
import {
	NOTIFICATION_CATEGORY,
	NOTIFICATION_TYPE,
} from '../../notification/notification.constant';

export interface SendNotifJobData {
	userId: string;
	type: NOTIFICATION_TYPE;
	category: NOTIFICATION_CATEGORY;
	[NOTIFICATION_TYPE.COMMENT_LIKED]: CommentLikedNotificationData;
}
