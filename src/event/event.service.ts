import { Injectable } from '@nestjs/common';
import { EVENT_NAMES } from './event.constant';
import { OnEvent } from '@nestjs/event-emitter';
import { NotifQueueService } from '../queues/notif-queue/notif-queue.service';
import { CommentLikedEvent } from '../common/events/comment-liked.event';
import { v4 as uuidV4 } from 'uuid';
import { NOTIF_JOB_PRIORITY } from '../queues/notif-queue/notif.constant';
import {
	NOTIFICATION_CATEGORY,
	NOTIFICATION_TYPE,
} from '../notification/notification.constant';
import { SendNotifJobData } from '../queues/notif-queue/notif-queue.interface';

@Injectable()
export class EventService {
	constructor(private notifQueueService: NotifQueueService) {}

	@OnEvent(EVENT_NAMES.COMMENT_REPLIED)
	handleCommentRepliedEvent() {}

	@OnEvent(EVENT_NAMES.COMMENT_LIKED)
	handleCommentLikedEvent({ commentLikedEventData }: CommentLikedEvent) {
		const {
			commentId,
			commentOwner,
			commentContent,
			entityId,
			entityType,
			entityContent,
		} = commentLikedEventData;

		this.notifQueueService.send<SendNotifJobData>(
			{
				userId: commentOwner,
				category: NOTIFICATION_CATEGORY.SOCIAL,
				type: NOTIFICATION_TYPE.COMMENT_LIKED,
				'comment:liked': {
					commentId,
					commentContent,
					entityContent,
					recipientId: commentOwner,
				},
			},
			{
				jobId: uuidV4(),
				priority: NOTIF_JOB_PRIORITY.NORMAL,
			},
		);
	}

	@OnEvent(EVENT_NAMES.ADMIN_BROADCAST)
	handlePublicAnnouncementEvent() {}
}
