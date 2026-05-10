import { Injectable } from '@nestjs/common';
import { CommentNotificationService } from './social/comment-notification.service';
import {
	NOTIFICATION_STATUS,
	NOTIFICATION_TYPE,
} from './notification.constant';
import { Cron } from '@nestjs/schedule';
import { DeleteResult, Model, UpdateResult } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
	CRON_EVERY_MONDAY,
	CRON_EVERY_MONTH,
} from '../common/constants/cron.constant';
@Injectable()
export class NotificationService {
	constructor(
		private readonly commentNotifService: CommentNotificationService,
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
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

	async markNotificationAsRead(
		notifDocument: NotificationDocument,
	): Promise<Pick<UpdateResult, 'acknowledged' | 'modifiedCount'>> {
		const { acknowledged, modifiedCount } = await notifDocument.updateOne({
			$set: { status: NOTIFICATION_STATUS.READ },
		});
		return { acknowledged, modifiedCount };
	}

	@Cron(CRON_EVERY_MONDAY)
	deleteReadNotifications(): Promise<DeleteResult> {
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

		return this.notificationModel.deleteMany({
			createdAt: { $lte: oneWeekAgo },
			status: NOTIFICATION_STATUS.READ,
		});
	}

	@Cron(CRON_EVERY_MONTH)
	deleteUnreadNotifications(): Promise<DeleteResult> {
		const DAYS_IN_MONTH = 30;

		const thresholdDate = new Date();
		thresholdDate.setDate(thresholdDate.getDate() - DAYS_IN_MONTH);

		return this.notificationModel.deleteMany({
			createdAt: { $lte: thresholdDate },
			status: {
				$ne: NOTIFICATION_STATUS.READ,
			},
		});
	}
}
