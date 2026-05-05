import { Injectable } from '@nestjs/common';
import { existsSync, PathLike } from 'fs';
import { unlink } from 'fs/promises';
import { AppLogger } from '../logger/logger.service';
import {
	fileKeyNameOptions,
	ImageSizeInfo,
	UniqueTempFileNameOpts,
} from './file.interfaces';
import { createHash } from 'crypto';
import { v4 as uuidV4 } from 'uuid';
import { fileTypeFromFile } from 'file-type';
import sharp from 'sharp';

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

	generateUniqueTempFilename(opts: UniqueTempFileNameOpts): string {
		const { userId, suffix, originalFileName } = opts;
		const hashName = createHash('md5')
			.update(
				`${Date.now()}.${userId}.${originalFileName ?? ''}.${uuidV4()}}`,
			)
			.digest('hex');
		const filename = `${hashName}${suffix ?? ''}`;
		return filename;
	}

	generateFileKey(opts: fileKeyNameOptions): string {
		const { userId, suffix, extension, originalFileName } = opts;
		const hashName = createHash('md5')
			.update(`${userId}.${originalFileName}`)
			.digest('hex');
		const filename = `${hashName}${suffix}${extension}`;
		return filename;
	}

	async getFileExtFromMagicNumbers(
		filePath: PathLike,
	): Promise<string | undefined> {
		if (!existsSync(filePath)) throw new Error('file not exists');
		const result = await fileTypeFromFile(filePath as string);
		if (result) return result.ext;
		return undefined;
	}

	async getOriginalImageSizeInfo(
		fileContent: Buffer,
	): Promise<ImageSizeInfo> {
		const { width, height } = await sharp(fileContent, {}).metadata();
		return { w: width, h: height, tag: 'original', suffix: '_origin' };
	}

	async generateWebpVariantImages(
		filePath: string,
		sizeInfo: ImageSizeInfo,
		fileNameOpts: Omit<fileKeyNameOptions, 'extension'>,
	): Promise<{ buffer: Buffer; key: string }> {
		const { w, h } = sizeInfo;
		const key = this.generateFileKey({
			...fileNameOpts,
			extension: '.webp',
		});
		const buffer = await sharp(filePath)
			.resize(w, h, { fit: 'cover' })
			.webp()
			.toBuffer();
		return { key, buffer };
	}
}
