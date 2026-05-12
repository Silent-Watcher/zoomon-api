import {
	Controller,
	Get,
	InternalServerErrorException,
	Param,
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
import { Idempotent } from './common/decorators/idempotent.decorator';
import { AppService } from './app.service';
import { IdempotencyData } from './common/decorators/idempotency-data.decorator';
import type { IdempotencyRequestData } from './idempotency/idempotency.interface';

@Controller()
export class AppController {
	constructor(
		private readonly logger: AppLogger,
		private readonly sseService: SseService,
		private readonly appService: AppService,
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
	sse(@User('id') userId: string): Observable<SseEvent> {
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

	// @Public()
	@Idempotent()
	@Get('test/:id')
	async test(
		@Param('id') targetEntityId: string,
		@User('id') userId: string,
		@IdempotencyData() idempotencyData: IdempotencyRequestData,
	) {
		return this.appService.handleTest(
			userId,
			targetEntityId,
			idempotencyData,
		);
	}
}
