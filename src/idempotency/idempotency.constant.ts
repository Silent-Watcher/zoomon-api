export enum IDEMPOTENCY_STATUS {
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	FAILED = 'failed',
}

export enum IDEMPOTENCY_OPERATION {
	CREATE_ARTICLE = 'article:create',
}

export enum IDEMPOTENCY_RESOLUTION_TYPE {
	REPLAY = 'REPLAY',
	EXECUTE = 'EXECUTE',
}

export const IDEMPOTENCY_HEADER = 'idempotency-key';
export const IDEMPOTENCY_LOCK_KEY_EXPIRES_IN_SECONDS = 30;
