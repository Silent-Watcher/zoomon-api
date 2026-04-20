import { Injectable } from '@nestjs/common';
import { AppLogger } from './logger/logger.service';

@Injectable()
export class AppService {
	constructor(private readonly logger: AppLogger) {
		this.logger.setContext(AppService.name);
	}

	getHello(): string {
		return 'Hello World!';
	}
}
