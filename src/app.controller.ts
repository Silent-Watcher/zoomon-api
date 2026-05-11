import {
	Controller,
	Get,
	InternalServerErrorException,
	Req,
	Sse,
} from '@nestjs/common';
import type { Request } from 'express';
import { AppLogger } from './logger/logger.service';
import { Public } from './common/decorators/public.decorator';
import { interval, map, merge, Observable, of } from 'rxjs';
import { SseService } from './sse/sse.service';
import { SseEvent } from './sse/sse.interface';
import { User } from './user/decorators/user.decorator';
import { NotificationService } from './notification/notification.service';
import { EmailQueueService } from './queues/email-queue/email-queue.service';
import { WELCOME_EMAIL_JOB_DATA } from './queues/email-queue/email-queue.interface';
import { v4 as uuidV4 } from 'uuid';
import { EMAIL_TEMPLATES } from './notification/notification.constant';

@Controller()
export class AppController {
	constructor(
		private readonly logger: AppLogger,
		private readonly sseService: SseService,
		private readonly notificationService: NotificationService,
		private readonly emailQueueService: EmailQueueService,
	) {
		this.logger.setContext(AppController.name);
	}

	@Public()
	@Get('csrf-token')
	getCsrfToken(@Req() req: Request) {
		if (typeof req.csrfToken !== 'function') {
			throw new InternalServerErrorException(
				'CSRF Middleware not initialized',
			);
		}
		const csrfToken = req.csrfToken();
		return { csrfToken };
	}

	@Sse('sse')
	sse(@User('_id') userId: string): Observable<SseEvent> {
		// Immediate connection confirmation

		const welcome$ = of({
			event: 'connected',
			data: { userId: userId.toString(), message: 'Connected to SSE' },
		});

		// Heartbeat every 3 seconds
		const heartbeat$ = interval(100).pipe(
			map(() => ({
				event: 'heartbeat',
				data: { timestamp: Date.now() },
			})),
		);

		// User-specific events
		const userEvents$ = this.sseService.userEvents$(userId.toString());

		return merge(welcome$, heartbeat$, userEvents$);
	}

	@Public()
	@Get('test')
	async test() {
		this.emailQueueService
			.addWelcomeEmailJob<WELCOME_EMAIL_JOB_DATA>(
				{
					recipient: 'ali@gmail.com',
					subject: 'welcome',
					payload: {
						template: EMAIL_TEMPLATES.WELCOME,
						context: { appName: 'zoomon' },
					},
				},
				{ jobId: uuidV4() },
			)
			.then(() => {});

		return 'email sent';
	}
}
