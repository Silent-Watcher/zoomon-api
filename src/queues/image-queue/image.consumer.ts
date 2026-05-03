import { Processor, WorkerHost } from '@nestjs/bullmq';
import { IMAGE_JOBS, IMAGE_QUEUE } from '../../common/constants/queue.constant';
import { Job } from 'bullmq';

@Processor(IMAGE_QUEUE)
export class ImageConsumer extends WorkerHost {
	process(job: Job, token?: string): Promise<any> {
		switch (job.name) {
			case IMAGE_JOBS.ARTICLE_IMAGE:
				return this.processAvatarImageJob();
			default:
				throw new Error('invalid image job name');
				break;
		}
	}

	private async processAvatarImageJob(): Promise<void> {}
}
