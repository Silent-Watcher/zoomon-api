import { Processor, WorkerHost } from '@nestjs/bullmq';
import { IMAGE_JOBS, IMAGE_QUEUE } from '../../common/constants/queue.constant';
import { Job } from 'bullmq';
import { FileService } from '../../file/file.service';
import { AVATAR_IMAGE_JOB_DATA } from './image-queue.interface';
import { ImageSizeInfo } from '../../file/file.interfaces';
import { IMAGE_SIZES, IMAGE_TYPE } from '../../file/file.constant';
import { UploadService } from '../../upload/upload.service';
import { Model } from 'mongoose';
import { User } from '../../user/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Processor(IMAGE_QUEUE)
export class ImageConsumer extends WorkerHost {
	constructor(
		@InjectModel(User.name)
		private readonly userModel: Model<User>,
		private readonly fileService: FileService,
		private readonly uploadService: UploadService,
	) {
		super();
	}

	process(job: Job, _token?: string): Promise<any> {
		switch (job.name) {
			case IMAGE_JOBS.USER_AVATAR:
				return this.processAvatarImageJob(job.data);
			default:
				throw new Error('invalid image job name');
		}
	}

	private async processAvatarImageJob(
		jobData: AVATAR_IMAGE_JOB_DATA,
	): Promise<any> {
		// todo: scan file for virus

		const { filePath, userId, originalSizeInfo, originalFileName } =
			jobData;
		let imageSizes: ImageSizeInfo[] = [
			originalSizeInfo,
			...IMAGE_SIZES[IMAGE_TYPE.AVATAR],
		];

		const imageVariants = await Promise.all(
			imageSizes.map((imageSize) =>
				this.fileService.generateWebpVariantImages(
					filePath as string,
					imageSize,
					{
						userId,
						originalFileName,
						suffix: imageSize.suffix,
					},
				),
			),
		);

		const uploadResults = await Promise.all(
			imageVariants.map(({ key, buffer }) =>
				this.uploadService.uploadFileDataToStorage(
					this.uploadService.generateStorageKey(
						`users/${userId}/avatars`,
						key,
					),
					buffer,
				),
			),
		);

		const uploadedImages = uploadResults
			.map((result) => {
				const url = result.url;
				const suffix = result.url
					.slice(url.indexOf('_'), url.indexOf('.'))
					.replace('_', '');
				return { suffix, url };
			})
			.map((image) => {
				return { [image['suffix']]: image['url'] };
			});

		const query = Object.assign({}, ...uploadedImages);

		await this.userModel.updateOne(
			{ _id: userId },
			{
				$set: {
					'avatars.upload': query,
				},
			},
		);

		await this.fileService.cleanupTempFile(filePath);

		return uploadedImages;
	}
}
