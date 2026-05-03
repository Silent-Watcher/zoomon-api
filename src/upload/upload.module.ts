import type { ConfigType } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { LoggerModule } from '../logger/logger.module';
import { StorageService } from './interfaces/storage.interface';
import storageConfig from '../common/configs/storage.config';
import { UPLOAD_STORAGE } from '../common/constants/storage.constant';
import { MinioStorageService } from './storage/minio-storage.service';
import { AppLogger } from '../logger/logger.service';

@Module({
	imports: [LoggerModule],
	providers: [
		UploadService,
		{
			provide: StorageService,
			useFactory(config: ConfigType<typeof storageConfig>) {
				switch (config.provider) {
					case UPLOAD_STORAGE.MINIO:
						return new MinioStorageService(config, new AppLogger());
					default:
						throw new Error(
							`Unknown storage provider: ${config.provider ?? '[UNDEFINED]'}`,
						);
				}
			},
			inject: [storageConfig.KEY, AppLogger],
		},
	],
	exports: [UploadService],
})
export class UploadModule {}
