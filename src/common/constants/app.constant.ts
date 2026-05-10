import { join } from 'node:path';

export enum AppEnvironment {
	Development = 'development',
	Production = 'production',
	Test = 'test',
}

export const SESSION_MAX_AGE_IN_MS = 7 * 24 * 3600 * 1000; // 1 week
export const EMAIL_TEMPLATES_PATH = join(
	process.cwd(),
	'src',
	'notification',
	'channels',
	'email',
	'templates',
);
