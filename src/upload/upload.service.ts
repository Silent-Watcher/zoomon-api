import { Inject, Injectable } from '@nestjs/common';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import apiConfig from '../common/configs/api.config';
import type { ConfigType } from '@nestjs/config';
import { existsSync, PathLike } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { FileDataLike } from './upload.interface';

@Injectable()
export class UploadService {
	private readonly temporarilyUploadPath: string;

	constructor(
		@Inject(apiConfig.KEY)
		private readonly apiConf: ConfigType<typeof apiConfig>,
	) {
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
}
