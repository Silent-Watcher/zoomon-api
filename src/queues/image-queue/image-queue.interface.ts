import { PathLike } from 'fs';
import { ImageSizeInfo } from '../../file/file.interfaces';

export interface AVATAR_IMAGE_JOB_DATA {
	filePath: PathLike;
	originalSizeInfo: ImageSizeInfo;
	originalFileName: string;
	userId: string;
}
