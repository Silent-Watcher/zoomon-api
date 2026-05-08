import { Injectable } from '@nestjs/common';
import { EVENT_NAMES } from './event.constant';
import { OnEvent } from '@nestjs/event-emitter';
import { NotifQueueService } from '../queues/notif-queue/notif-queue.service';
import { CommentLikedEvent } from '../common/events/comment-liked.event';
import { v4 as uuidV4 } from 'uuid';
import { CommentLikedJobData } from '../queues/notif-queue/notif-queue.interface';
import { NOTIF_JOB_PRIORITY } from '../queues/notif-queue/notif.constant';

@Injectable()
export class EventService {
	constructor(private notifQueueService: NotifQueueService) {}

	@OnEvent(EVENT_NAMES.COMMENT_REPLIED)
	handleCommentRepliedEvent() {}

	@OnEvent(EVENT_NAMES.COMMENT_LIKED)
	handleCommentLikedEvent({ commentLikedEventData }: CommentLikedEvent) {
		const { commentId, commentOwner, likedBy } = commentLikedEventData;
		const jobId = uuidV4();

		this.notifQueueService.send<CommentLikedJobData>(
			{
				commentId,
				commentOwner,
				likedBy,
			},
			{
				jobId,
				priority: NOTIF_JOB_PRIORITY.NORMAL,
			},
		);
	}

	@OnEvent(EVENT_NAMES.ADMIN_BROADCAST)
	handlePublicAnnouncementEvent() {}
}
