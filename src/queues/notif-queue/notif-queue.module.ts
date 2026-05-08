import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NOTIF_QUEUE } from '../../common/constants/queue.constant';
import { NotifQueueService } from './notif-queue.service';
import { NotifConsumer } from './notif.consumer';

@Module({
	imports: [
		BullModule.registerQueue({
			name: NOTIF_QUEUE,
		}),
	],
	providers: [NotifQueueService, NotifConsumer],
	exports: [NotifQueueService],
})
export class NotifQueueModule {}
