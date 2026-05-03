import { Inject, Injectable } from '@nestjs/common';
import {
	StorageDeleteOpts,
	StorageService,
	UploadOptions,
	UploadResult,
} from '../interfaces/storage.interface';
import { PathLike } from 'fs';
import { Client } from 'minio';
import storageConfig from '../../common/configs/storage.config';
import type { ConfigType } from '@nestjs/config';
import { AppLogger } from '../../logger/logger.service';
import { readFile } from 'fs/promises';

@Injectable()
export class MinioStorageService extends StorageService {
	private readonly client: Client;
	private readonly bucket: string;

	constructor(
		@Inject(storageConfig.KEY)
		private readonly storageConf: ConfigType<typeof storageConfig>,
		private readonly logger: AppLogger,
	) {
		super();

		this.logger.setContext(MinioStorageService.name);
		this.client = new Client({
			endPoint: this.storageConf.minio.endpoint,
			port: this.storageConf.minio.port,
			useSSL: this.storageConf.minio.useSsl,
			accessKey: this.storageConf.minio.accessKey,
			secretKey: this.storageConf.minio.secretKey,
		});

		this.bucket = this.storageConf.minio.bucketName;
		this.setupBucket();
	}

	private async setupBucket() {
		const exists = await this.client.bucketExists(this.bucket);
		if (!exists) {
			await this.client.makeBucket(this.bucket);
			this.logger.log(`Storage Bucket ${this.bucket} Created!`);
		}
	}

	async upload(
		key: string,
		data: Buffer | PathLike,
		options?: UploadOptions,
	): Promise<UploadResult> {
		const buffer = Buffer.isBuffer(data) ? data : await readFile(data);
		const { etag, versionId } = await this.client.putObject(
			this.bucket,
			key,
			buffer,
			buffer.length,
			options,
		);
		return {
			etag,
			key,
			bucket: this.bucket,
			url: `${this.storageConf.minio.baseUrl}/${this.bucket}/${key}`,
			versionId,
		};
	}

	async uploadFile(
		key: string,
		filePath: PathLike,
		options?: UploadOptions,
	): Promise<UploadResult> {
		const { etag, versionId } = await this.client.fPutObject(
			this.bucket,
			key,
			filePath as string,
		);
		return {
			etag,
			key,
			bucket: this.bucket,
			url: `${this.storageConf.minio.baseUrl}/${this.bucket}/${key}`,
			versionId,
		};
	}

	delete(key: string, opts?: StorageDeleteOpts): Promise<void> {
		return this.client.removeObject(this.bucket, key, opts);
	}

	getSignedUploadUrl(key: string, expiresIn = 3600): Promise<string> {
		return this.client.presignedPutObject(this.bucket, key, expiresIn);
	}

	getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
		return this.client.presignedGetObject(this.bucket, key, expiresIn);
	}

	async exists(key: string): Promise<boolean> {
		try {
			await this.client.statObject(this.bucket, key);
			return true;
		} catch (error) {
			return false;
		}
	}
}
