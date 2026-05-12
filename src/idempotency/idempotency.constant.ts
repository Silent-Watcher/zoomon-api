export enum IDEMPOTENCY_STATUS {
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	FAILED = 'failed',
}

export const IDEMPOTENCY_HEADER = 'idempotency-key';
export const IDEMPOTENCY_LOCK_KEY_EXPIRES_IN_SECONDS = 30;
