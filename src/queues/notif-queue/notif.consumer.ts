import { Processor, WorkerHost } from '@nestjs/bullmq';
import { NOTIF_QUEUE } from '../../common/constants/queue.constant';
import { Job } from 'bullmq';
import { CommentLikedJobData } from './notif-queue.interface';
@Processor(NOTIF_QUEUE, {
	concurrency: 10,
	limiter: {
		max: 100,
		duration: 1000,
	},
})
export class NotifConsumer extends WorkerHost {
	constructor() {
		super();
	}

	process({ name, data }: Job, _token?: string): Promise<any> {
		switch (name) {
			case 'send':
				return this.processNotification(data);
			case 'batch':
				return this.processBatchNotifications({});
			case 'digest':
				return this.sendDigest({});
			case 'cleanup':
				return this.cleanupExpired({});
			default:
				throw new Error('Unknown job type');
		}
	}

	private async processNotification(data: CommentLikedJobData) {}
	private async processBatchNotifications(data: any) {}
	private async sendDigest(data: any) {}
	private async cleanupExpired(data: any) {}
}
