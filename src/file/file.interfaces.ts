export interface UniqueTempFileNameOpts {
	userId: string;
	suffix?: string;
	originalFileName?: string;
}

export interface fileKeyNameOptions {
	userId: string;
	suffix: string;
	originalFileName: string;
	extension: `.${string}`;
}

export interface ImageSizeInfo {
	tag: string;
	w: number;
	h: number;
	suffix: string;
}
