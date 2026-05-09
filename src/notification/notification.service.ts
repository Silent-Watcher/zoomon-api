import { Injectable } from '@nestjs/common';
import { CommentNotificationService } from './social/comment-notification.service';
import { NOTIFICATION_TYPE } from './notification.constant';
@Injectable()
export class NotificationService {
	constructor(
		private readonly commentNotifService: CommentNotificationService,
	) {}

	getServiceHandler(notifType: NOTIFICATION_TYPE) {
		switch (notifType) {
			case NOTIFICATION_TYPE.COMMENT_LIKED:
				return this.commentNotifService.sendCommentLikedNotification.bind(
					this.commentNotifService,
				);
			default:
				throw new Error('Unknown Notification Type');
		}
	}
}
