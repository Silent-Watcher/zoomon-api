import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
	imports: [LoggerModule],
	providers: [FileService],
	exports: [FileService],
})
export class FileModule {}
