import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';

export enum IMAGE_SIZE_LIMIT {
	_2MB = 2 * 1024 * 1024,
	_100KB = 100 * 1000,
}

export const ALLOWED_MIME_TYPES_REGEX =
	/^image\/(jpeg|png|webp|avif|heic|heif)$/;

export const parseFilePipe = new ParseFilePipeBuilder()
	.addFileTypeValidator({
		fileType: ALLOWED_MIME_TYPES_REGEX,
	})
	.addMaxSizeValidator({
		maxSize: IMAGE_SIZE_LIMIT._100KB,
	})
	.build({
		errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
	});
