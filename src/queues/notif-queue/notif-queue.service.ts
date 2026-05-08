import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { NOTIF_JOBS, NOTIF_QUEUE } from '../../common/constants/queue.constant';
import { JobsOptions, Queue } from 'bullmq';

@Injectable()
export class NotifQueueService {
	constructor(@InjectQueue(NOTIF_QUEUE) private readonly notifQueue: Queue) {}

	addCommentRepliedNotifJob<D>(data: D, opts?: JobsOptions) {
		return this.notifQueue.add(NOTIF_JOBS.COMMENT_REPLIED, data, opts);
	}
}
