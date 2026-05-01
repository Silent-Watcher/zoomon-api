import { Module } from '@nestjs/common';
import { CursorUtil } from './cursor.service';

@Module({
	providers: [CursorUtil],
	exports: [CursorUtil],
})
export class UtilModule {}
