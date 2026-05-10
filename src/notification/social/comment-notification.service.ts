import { InjectRedis } from '@nestjs-modules/ioredis';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Model } from 'mongoose';
import apiConfig from '../../common/configs/api.config';
import { truncateText } from '../../common/helpers/text.helper';
import { SseService } from '../../sse/sse.service';
import { CommentLikedNotificationData } from '../interfaces/notification.interface';
import {
	NOTIFICATION_CATEGORY,
	NOTIFICATION_STATUS,
	NOTIFICATION_TYPE,
	USER_UNREAD_NOTIF_REDIS_KEY,
} from '../notification.constant';
import { Notification } from '../notification.schema';

@Injectable()
export class CommentNotificationService {
	private readonly unreadNotifRefisKey: string;

	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
		private readonly sseService: SseService,
		@InjectRedis() private readonly redis: Redis,
		@Inject(apiConfig.KEY)
		private readonly apiConf: ConfigType<typeof apiConfig>,
	) {
		this.unreadNotifRefisKey = `${this.apiConf.appName}`;
	}

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

		const isUserOnline = await this.sseService.isUserOnline(recipientId);

		if (isUserOnline) {
			this.sseService.emit({
				event: 'notification',
				data: { notification, userId: recipientId },
			});

			await notification.updateOne({
				$set: { status: NOTIFICATION_STATUS.SENT, sentAt: new Date() },
			});
		} else {
			const unreadKey = `${this.unreadNotifRefisKey}:${USER_UNREAD_NOTIF_REDIS_KEY(recipientId)}`;
			await this.redis.incr(unreadKey);
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
