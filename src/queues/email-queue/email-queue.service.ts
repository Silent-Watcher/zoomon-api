import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { EMAIL_JOBS, EMAIL_QUEUE } from '../../common/constants/queue.constant';
import { JobsOptions, Queue } from 'bullmq';

@Injectable()
export class EmailQueueService {
	constructor(@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue) {}

	addWelcomeEmailJob<D>(data: D, opts?: JobsOptions) {
		console.log('adding email job...');
		return this.emailQueue.add(EMAIL_JOBS.WELCOME_EMAIL, data, opts);
	}

	addOtpEmailJob<D>(data: D, opts?: JobsOptions) {
		return this.emailQueue.add(EMAIL_JOBS.OTP_EMAIL, data, opts);
	}
}
