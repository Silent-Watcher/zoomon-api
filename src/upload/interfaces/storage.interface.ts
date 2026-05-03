import { PathLike } from 'node:fs';
import type Stream from 'node:stream';

export type FileDataLike =
	| string
	| NodeJS.ArrayBufferView
	| Iterable<string | NodeJS.ArrayBufferView>
	| AsyncIterable<string | NodeJS.ArrayBufferView>
	| Stream;

export interface UploadResult {
	url: string;
	key: string;
	bucket?: string;
	etag?: string;
	versionId?: string | null;
}

export interface UploadOptions {
	contentType?: string;
	metadata?: Record<string, string>;
	acl?: 'private' | 'public-read' | 'public-read-write';
}

export interface StorageDeleteOpts {
	versionId?: string;
	governanceBypass?: boolean;
	forceDelete?: boolean;
}

export abstract class StorageService {
	abstract upload(
		key: string,
		data: Buffer | PathLike,
		options?: UploadOptions,
	): Promise<UploadResult>;
	abstract uploadFile(
		key: string,
		filePath: PathLike,
		options?: UploadOptions,
	): Promise<UploadResult>;
	abstract delete(key: string): Promise<void>;
	abstract getSignedUploadUrl(
		key: string,
		expiresIn?: number,
	): Promise<string>;
	abstract getSignedDownloadUrl(
		key: string,
		expiresIn?: number,
	): Promise<string>;
	abstract exists(key: string): Promise<boolean>;
}
