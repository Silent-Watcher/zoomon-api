import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { IMAGE_QUEUE } from '../../common/constants/queue.constant';
import { ImageConsumer } from './image.consumer';
import { ImageQueueService } from './image-queue.service';

@Module({
	imports: [
		BullModule.registerQueue({
			name: IMAGE_QUEUE,
		}),
	],
	providers: [ImageConsumer, ImageQueueService],
	exports: [BullModule, ImageQueueService],
})
export class ImageQueueModule {}
