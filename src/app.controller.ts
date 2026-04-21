import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Secured } from './auth/secured.guard';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@UseGuards(Secured)
	@Get('whoami')
	protected() {
		return 'protected route!';
	}
}
