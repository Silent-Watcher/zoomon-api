import { Processor, WorkerHost } from '@nestjs/bullmq';
import { NOTIF_JOBS, NOTIF_QUEUE } from '../../common/constants/queue.constant';
import { Job } from 'bullmq';
import { COMMENT_REPLIED_JOB_DATA } from './notif-queue.interface';

@Processor(NOTIF_QUEUE)
export class NotifConsumer extends WorkerHost {
	constructor() {
		super();
	}

	process(job: Job, _token?: string): Promise<any> {
		switch (job.name) {
			case NOTIF_JOBS.COMMENT_REPLIED:
				return this.processCommentRepliedJobNotif({});
			default:
				throw new Error('invalid notif job name');
		}
	}

	private async processCommentRepliedJobNotif(
		jobData: COMMENT_REPLIED_JOB_DATA,
	) {
		console.log('[queue]: processing comment replied notification ...');
	}
}
