import { Inject, Injectable } from '@nestjs/common';
import { CommentNotificationService } from './social/comment-notification.service';
import {
	EMAIL_CHANNEL,
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
import type {
	EmailChannelServicePayload,
	NotificationChannelService,
} from './interfaces/notification-channels.interface';
@Injectable()
export class NotificationService {
	constructor(
		private readonly commentNotifService: CommentNotificationService,
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
		@Inject(EMAIL_CHANNEL)
		private readonly emailChannel: NotificationChannelService<EmailChannelServicePayload>,
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

	sendEmail(
		recipient: string,
		subject: string,
		payload: EmailChannelServicePayload,
	) {
		return this.emailChannel.send(recipient, subject, payload);
	}

	async markNotificationAsRead(
		notifDocument: NotificationDocument,
	): Promise<Pick<UpdateResult, 'acknowledged' | 'modifiedCount'>> {
		const { acknowledged, modifiedCount } = await notifDocument.updateOne({
			$set: { status: NOTIFICATION_STATUS.READ },
		});
		return { acknowledged, modifiedCount };
	}

	async markAllNotificationsAsRead(
		userId: string,
	): Promise<Pick<UpdateResult, 'acknowledged' | 'modifiedCount'>> {
		const { acknowledged, modifiedCount } =
			await this.notificationModel.updateMany(
				{
					recipientId: userId,
					status: {
						$in: [
							NOTIFICATION_STATUS.SENT,
							NOTIFICATION_STATUS.DELIVERED,
						],
					},
					$or: [
						{ expiresAt: { $exists: false } },
						{ expiresAt: { $gt: new Date() } },
					],
				},
				{
					$set: { status: NOTIFICATION_STATUS.READ },
				},
			);
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
