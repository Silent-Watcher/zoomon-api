import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../notification.schema';
import { CommentLikedNotificationData } from '../notification.interface';

@Injectable()
export class CommentNotificationService {
	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
	) {}

	sendCommentLikedNotification(data: CommentLikedNotificationData) {
		console.log('send comment liked notification...');
	}
}
