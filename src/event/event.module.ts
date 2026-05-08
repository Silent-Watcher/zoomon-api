import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { NotificationListener } from './notification.listener';
import { NotifQueueModule } from '../queues/notif-queue/notif-queue.module';

@Module({
	imports: [NotifQueueModule],
	providers: [EventService, NotificationListener],
	exports: [NotificationListener],
})
export class EventModule {}
