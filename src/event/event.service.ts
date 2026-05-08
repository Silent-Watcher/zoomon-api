import { Injectable } from '@nestjs/common';
import { EVENT_NAMES } from './event.constant';
import { OnEvent } from '@nestjs/event-emitter';
import { NotifQueueService } from '../queues/notif-queue/notif-queue.service';

@Injectable()
export class EventService {
	constructor(private notifQueueService: NotifQueueService) {}

	@OnEvent(EVENT_NAMES.COMMENT_REPLIED)
	handleCommentRepliedEvent() {}

	@OnEvent(EVENT_NAMES.COMMENT_LIKED)
	handleCommentLikedEvent() {}

	@OnEvent(EVENT_NAMES.ADMIN_BROADCAST)
	handlePublicAnnouncementEvent() {}
}
