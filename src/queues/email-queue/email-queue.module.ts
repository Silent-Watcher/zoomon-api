import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EMAIL_QUEUE } from '../../common/constants/queue.constant';
import { EmailQueueService } from './email-queue.service';
import { NotificationModule } from '../../notification/notification.module';
import { EmailConsumer } from './email.consumer';

@Module({
	imports: [
		NotificationModule,
		BullModule.registerQueue({
			name: EMAIL_QUEUE,
			defaultJobOptions: {
				attempts: 5,
				backoff: {
					type: 'exponential',
					delay: 5000,
				},

				removeOnComplete: {
					age: 3600, // keep for 1 hour
					count: 1000,
				},

				removeOnFail: {
					age: 24 * 3600, // keep failed jobs for debugging
				},
			},
		}),
	],
	providers: [EmailQueueService, EmailConsumer],
	exports: [EmailQueueService],
})
export class EmailQueueModule {}
