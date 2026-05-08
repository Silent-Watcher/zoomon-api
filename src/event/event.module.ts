import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { NotifQueueModule } from '../queues/notif-queue/notif-queue.module';

@Module({
	imports: [NotifQueueModule],
	providers: [EventService],
	exports: [EventService],
})
export class EventModule {}
