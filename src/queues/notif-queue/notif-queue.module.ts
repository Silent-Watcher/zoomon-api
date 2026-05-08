import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NOTIF_QUEUE } from '../../common/constants/queue.constant';
import { NotifQueueService } from './notif-queue.service';
import { NotifConsumer } from './notif.consumer';

@Module({
	imports: [
		BullModule.registerQueue({
			name: NOTIF_QUEUE,
			defaultJobOptions: {
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 2000,
				},
				removeOnComplete: {
					age: 86400, // keep completed jobs for 24h
					count: 1000,
				},
				removeOnFail: {
					age: 604800, // keep failed jobs for 7 days
				},
			},
		}),
	],
	providers: [NotifQueueService, NotifConsumer],
	exports: [NotifQueueService],
})
export class NotifQueueModule {}
