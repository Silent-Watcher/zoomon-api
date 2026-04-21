import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Secured } from './auth/auth.guard';
import type { Request } from 'express';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(@Req() req: Request) {
		return {
			session: req.session,
			sessionID: req.sessionID,
		};
	}

	@UseGuards(Secured)
	@Get('whoami')
	protected() {
		return 'protected route!';
	}
}
