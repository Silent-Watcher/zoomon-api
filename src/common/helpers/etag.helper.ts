import { Document } from 'mongoose';
import crypto from 'node:crypto';

export function generateEtag(data: unknown): string {
	return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

export function generateEntityEtag(entity: Document) {
	let data: {
		id: string;
		version?: string;
		updatedAt?: string;
	} = { id: entity._id.toHexString() };

	if (entity['version']) data.version = entity['version'];
	if (entity['updatedAt']) data.updatedAt = entity['updatedAt'];

	return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}
