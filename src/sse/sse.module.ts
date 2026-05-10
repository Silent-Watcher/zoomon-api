import { Module } from '@nestjs/common';
import { SseService } from './sse.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
	imports: [LoggerModule],
	providers: [SseService],
	exports: [SseService],
})
export class SseModule {}
