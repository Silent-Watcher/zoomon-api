import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import apiConfig from '../common/configs/api.config';

export interface CursorPayload {
	primary: unknown;
	id: string;
}

@Injectable()
export class CursorUtil {
	constructor(
		@Inject(apiConfig.KEY)
		private readonly apiConf: ConfigType<typeof apiConfig>,
	) {}

	sign(payload: CursorPayload): string {
		const cursorPayload = JSON.stringify(payload);
		const sig = createHmac('sha256', this.apiConf.cursorSecret)
			.update(cursorPayload)
			.digest('hex');
		const token = JSON.stringify({ payload, sig });
		return Buffer.from(token).toString('base64');
	}

	verify(cursor: string): CursorPayload {
		try {
			const tokenStr = Buffer.from(cursor, 'base64').toString('utf8');
			const token = JSON.parse(tokenStr);
			const expectedSig = createHmac('sha256', this.apiConf.cursorSecret)
				.update(JSON.stringify(token.payload))
				.digest('hex');
			if (expectedSig !== token.sig)
				throw new Error('Invalid cursor signature');
			return token.payload;
		} catch (error) {
			if (error instanceof Error)
				throw new Error(error.message, {
					cause: 'DECODE_CURSOR_FAILED',
				});
			throw new Error('failed to decode the input cursor', {
				cause: 'DECODE_CURSOR_FAILED',
			});
		}
	}
}
