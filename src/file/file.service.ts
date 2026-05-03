import { Injectable } from '@nestjs/common';
import { PathLike } from 'fs';
import { unlink } from 'fs/promises';
import { AppLogger } from '../logger/logger.service';
import { UniqueFileNameOpts } from './file.interfaces';
import { createHash } from 'crypto';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class FileService {
	constructor(private readonly logger: AppLogger) {
		this.logger.setContext(FileService.name);
	}

	async cleanupTempFile(filePath: PathLike): Promise<void> {
		try {
			await unlink(filePath);
		} catch (error) {
			// temp cleanup failure shouldn't break the flow
			this.logger.warn(`Failed to cleanup temp file ${filePath}:`, error);
		}
	}

	generateUniqueFilename(opts: UniqueFileNameOpts): string {
		const { userId, originalFileName, size, suffix, extension } = opts;
		const hashName = createHash('md5')
			.update(`${Date.now()}.${originalFileName}.${userId}.${uuidV4()}}`)
			.digest('hex');
		const filename = `${hashName}-${size}-${suffix}${extension}`;
		return filename;
	}
}
