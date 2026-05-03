import { Processor } from '@nestjs/bullmq';
import { IMAGE_QUEUE } from '../../common/constants/queue.constant';

@Processor(IMAGE_QUEUE)
export class ImageConsumer {}
