import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { IMAGE_JOBS, IMAGE_QUEUE } from '../../common/constants/queue.constant';
import { JobsOptions, Queue } from 'bullmq';

@Injectable()
export class ImageQueueService {
	constructor(@InjectQueue(IMAGE_QUEUE) private readonly imageQueue: Queue) {}

	addArticleImageJob<D>(data: D, opts?: JobsOptions) {
		return this.imageQueue.add(IMAGE_JOBS.ARTICLE_IMAGE, data, opts);
	}

	addAvatarJob<D>(data: D, opts?: JobsOptions) {
		return this.imageQueue.add(IMAGE_JOBS.USER_AVATAR, data, opts);
	}

	addBgImageJob<D>(data: D, opts?: JobsOptions) {
		return this.imageQueue.add(IMAGE_JOBS.USER_BG_IMAGE, data, opts);
	}
}
