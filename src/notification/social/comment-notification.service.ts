import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../notification.schema';
import { CommentLikedNotificationData } from '../notification.interface';
import { truncateText } from '../../common/helpers/text.helper';
import {
	NOTIFICATION_CATEGORY,
	NOTIFICATION_STATUS,
	NOTIFICATION_TYPE,
	USER_UNREAD_NOTIF_REDIS_KEY,
} from '../notification.constant';
import { SseService } from '../../sse/sse.service';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class CommentNotificationService {
	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
		private readonly sseService: SseService,
		@InjectRedis() private readonly redis: Redis,
	) {}

	async sendCommentLikedNotification(
		data: CommentLikedNotificationData,
	): Promise<Notification> {
		const { commentContent, commentId, entityContent, recipientId } = data;

		const template = this.getNotificationTemplate(
			'liked',
			commentContent,
			entityContent,
		);

		const notification = await this.notificationModel.create({
			body: template,
			recipientId: recipientId,
			title: 'New Like!',
			type: NOTIFICATION_TYPE.COMMENT_LIKED,
			status: NOTIFICATION_STATUS.PENDING,
			metadata: {
				commentId,
			},
			category: NOTIFICATION_CATEGORY.SOCIAL,
		});

		const isUserOnline = this.sseService.hasConnection(recipientId);

		if (isUserOnline) {
			this.sseService.emit({
				event: 'notification',
				data: { notification, userId: recipientId },
			});

			await notification.updateOne({
				$set: { status: NOTIFICATION_STATUS.SENT, sentAt: new Date() },
			});
		} else {
			await this.redis.incr(USER_UNREAD_NOTIF_REDIS_KEY(recipientId));
		}

		return notification;
	}

	getNotificationTemplate(
		type: 'liked' | 'replied',
		commentContent: string,
		entityContent: string,
	) {
		const template = `The comment “${truncateText(commentContent)}” on the article “${truncateText(entityContent)}” has received 1 new ${type == 'liked' ? 'like' : 'reply'}`;
		return template;
	}
}
