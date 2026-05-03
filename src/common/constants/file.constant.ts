import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';

export enum IMAGE_SIZE_LIMIT {
	_2MB = 2 * 1024 * 1024,
	_100KB = 100 * 1000,
}

export const USER_AVATAR_UPLOAD_DIRECTORY = 'avatars';

export const ALLOWED_AVATAR_MIME_TYPES_REGEX =
	/^image\/(jpeg|png|webp|avif|heic|heif)$/;

export const parseUserAvatarFilePipe = new ParseFilePipeBuilder()
	.addFileTypeValidator({
		fileType: ALLOWED_AVATAR_MIME_TYPES_REGEX,
	})
	.addMaxSizeValidator({
		maxSize: IMAGE_SIZE_LIMIT._2MB,
	})
	.build({
		errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
	});

// export const userAvatarDiskStorage = diskStorage({
// 	filename(req, _file, callback) {
// 		const userId = (req[DATA_CONTEXT_KEY][USER_CONTEXT_KEY] as UserDocument)._id.toHexString()
// 		const fileName = `${new Date()}.${userId}.${uuidV4()}}`
// 		return callback(null, fileName)
// 	},
// 	async destination(_req, _file, callback) {
// 		const tempDir = tmpdir()
// 		const uploadPath = join(tempDir, 'myApp', 'uploads', 'avatars')
// 		if (!existsSync(uploadPath)) {
// 			await mkdir(uploadPath, { recursive: true })
// 		}
// 		callback(null, uploadPath)
// 	},
// })
