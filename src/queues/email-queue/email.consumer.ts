import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EMAIL_JOBS, EMAIL_QUEUE } from '../../common/constants/queue.constant';
import { Job } from 'bullmq';
import { WELCOME_EMAIL_JOB_DATA } from './email-queue.interface';
import { NotificationService } from '../../notification/notification.service';

@Processor(EMAIL_QUEUE)
export class EmailConsumer extends WorkerHost {
	constructor(private readonly notificationService: NotificationService) {
		super();
	}

	process(job: Job, _token?: string): Promise<any> {
		switch (job.name) {
			case EMAIL_JOBS.WELCOME_EMAIL:
				return this.processWelcomeEmailJob(job.data);
			default:
				throw new Error('invalid Email job name');
		}
	}

	private async processWelcomeEmailJob(
		jobData: WELCOME_EMAIL_JOB_DATA,
	): Promise<any> {
		const {
			payload: { context, template },
			recipient,
			subject,
		} = jobData;

		this.notificationService.sendEmail(recipient, subject, {
			context,
			template,
		});
	}
}
