import { Inject, Injectable } from '@nestjs/common';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import apiConfig from '../common/configs/api.config';
import type { ConfigType } from '@nestjs/config';
import { existsSync, PathLike } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import {
	FileDataLike,
	StorageService,
	UploadResult,
} from './interfaces/storage.interface';
import { AppLogger } from '../logger/logger.service';

@Injectable()
export class UploadService {
	private readonly temporarilyUploadPath: string;

	constructor(
		@Inject(apiConfig.KEY)
		private readonly apiConf: ConfigType<typeof apiConfig>,
		private readonly storageService: StorageService,
		private readonly logger: AppLogger,
	) {
		this.logger.setContext(UploadService.name);

		this.temporarilyUploadPath = join(
			tmpdir(),
			'myApp',
			this.apiConf.appName,
		);
	}

	async uploadFileToTemporarilyDisk(
		directory: string,
		filename: string,
		data: FileDataLike,
	): Promise<PathLike> {
		if (filename.trim().length == 0 || directory.trim().length == 0) {
			throw new Error('filname or directory should not be empty');
		}

		const uploadPath: PathLike = `${this.temporarilyUploadPath}/${directory}`;
		const filePath: PathLike = `${uploadPath}/${filename}`;

		if (!existsSync(uploadPath)) {
			await mkdir(uploadPath, { recursive: true });
		}

		await writeFile(filePath, data);
		return filePath;
	}

	uploadFileDataToStorage(
		key: string,
		data: FileDataLike,
		contentType?: string,
	): Promise<UploadResult> {
		return this.storageService.upload(key, data as Buffer, { contentType });
	}

	uploadFilePathToStorage(
		key: string,
		path: PathLike,
		contentType?: string,
	): Promise<UploadResult> {
		return this.storageService.uploadFile(key, path, { contentType });
	}

	deleteFromStorage(key: string): Promise<void> {
		return this.storageService.delete(key);
	}

	generateStorageKey(directory: string, filename: string): string {
		return `${directory}/${filename}`;
	}

	getSignedUploadUrl(key: string, expiresIn?: number): Promise<string> {
		return this.storageService.getSignedUploadUrl(key, expiresIn);
	}

	getSignedDownloadUrl(key: string, expiresIn?: number): Promise<string> {
		return this.storageService.getSignedDownloadUrl(key, expiresIn);
	}
}
