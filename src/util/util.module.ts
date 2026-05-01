import { Module } from '@nestjs/common';
import { ApiUtil } from './api.util';
import { CursorUtil } from './cursor.util';
@Module({
	providers: [CursorUtil, ApiUtil],
	exports: [CursorUtil, ApiUtil],
})
export class UtilModule {}
