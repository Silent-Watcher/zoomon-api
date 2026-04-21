import { pbkdf2Sync, randomBytes } from 'node:crypto';

export function hashPassword(password: string): string {
	const salt = randomBytes(10).toString('hex');
	const result = pbkdf2Sync(password, salt, 10, 32, 'sha512').toString('hex');
	return `${salt}.${result}`;
}

export function comparePassword(password: string, hash: string): boolean {
	const salt = hash.split('.')[0];
	const result = pbkdf2Sync(password, salt, 10, 32, 'sha512').toString('hex');
	const genHash = `${salt}.${result}`;
	return genHash === hash;
}
