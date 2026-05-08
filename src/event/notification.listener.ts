import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_NAMES } from './event.constant';
import { TestCreatedEvent } from '../common/events/test-created.event';
import { NotifQueueService } from '../queues/notif-queue/notif-queue.service';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class NotificationListener {
	constructor(private notifQueueService: NotifQueueService) {}

	@OnEvent(EVENT_NAMES.COMMENT_REPLIED)
	handleCommentRepliedEvent() {}

	@OnEvent(EVENT_NAMES.COMMENT_LIKED)
	handleCommentLikedEvent() {}

	@OnEvent(EVENT_NAMES.PUBLIC_ANNOUNCEMENT)
	handlePublicAnnouncementEvent() {}

	@OnEvent('test:created')
	handleTestCreatedEvent(payload: TestCreatedEvent) {
		console.log('event triggered ...');
		const jobId = uuidV4();

		this.notifQueueService.addCommentRepliedNotifJob({}, { jobId });
	}
}
