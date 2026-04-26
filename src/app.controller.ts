import {
	Controller,
	Get,
	InternalServerErrorException,
	Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AppLogger } from './logger/logger.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
	constructor(private readonly logger: AppLogger) {
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
}
