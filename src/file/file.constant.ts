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

export enum IMAGE_TYPE {
	ARTICLE = 'article',
	AVATAR = 'avatar',
	PROFILE_BG = 'profileBackground',
}

export const IMAGE_SIZES = Object.freeze({
	[IMAGE_TYPE.AVATAR]: [
		{ tag: 'smallThumb', w: 64, h: 64, suffix: '_sm' },
		{ tag: 'medium', w: 128, h: 128, suffix: '_md' },
		{ tag: 'large', w: 256, h: 256, suffix: '_lg' },
	] as const,
	[IMAGE_TYPE.PROFILE_BG]: [
		{ tag: 'mobile', w: 960, h: 540, suffix: '_m' },
		{ tag: 'standard', w: 1920, h: 1080, suffix: '_std' },
		{ tag: 'high-res', w: 2560, h: 1440, suffix: '_hd' },
	] as const,
	[IMAGE_TYPE.ARTICLE]: [
		{ tag: 'thumbnail', w: 400, h: 225, suffix: '_thumb' },
		{ tag: 'medium', w: 400, h: 225, suffix: '_md' },
		{ tag: 'large', w: 400, h: 225, suffix: '_lg' },
	] as const,
} as const);
