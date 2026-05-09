import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { NOTIF_QUEUE } from '../../common/constants/queue.constant';
import { Job, Queue } from 'bullmq';
import { NotificationService } from '../../notification/notification.service';
import { UserPreferenceService } from '../../user-preference/user-preference.service';
import { v4 as uuidV4 } from 'uuid';
import { SendNotifJobData } from './notif-queue.interface';
@Processor(NOTIF_QUEUE, {
	concurrency: 10,
	limiter: {
		max: 100,
		duration: 1000,
	},
})
export class NotifConsumer extends WorkerHost {
	constructor(
		@InjectQueue(NOTIF_QUEUE)
		private readonly notifQueue: Queue,
		private readonly notificationService: NotificationService,
		private readonly userPreferenceService: UserPreferenceService,
	) {
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

	private async processNotification(data: SendNotifJobData) {
		const { type, category, userId } = data;

		const now = new Date();
		const { result: isInQuietHours, delayUntilEnd } =
			await this.userPreferenceService.isInQuietHours(
				userId,
				now,
				category,
			);

		if (isInQuietHours) {
			if (delayUntilEnd) {
				const jobId = uuidV4();
				await this.notifQueue.add('send', data, {
					delay: delayUntilEnd,
					jobId,
				});
			}
			return;
		}

		const handler = this.notificationService.getServiceHandler(type);
		const notifData = data[type];
		handler(notifData);
	}
	private async processBatchNotifications(data: any) {}
	private async sendDigest(data: any) {}
	private async cleanupExpired(data: any) {}
}
