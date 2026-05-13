import {
	IDEMPOTENCY_OPERATION,
	IDEMPOTENCY_RESOLUTION_TYPE,
} from './idempotency.constant';
import { IdempotencyDocument } from './idempotency.schema';

export interface IdempotencyFindQueryData {
	key: string;
	userId: string;
	operationName: string;
	targetResourceId?: string;
}

export interface IdempotencyRequestData {
	lockToken: string;
	key: string;
	requestFingerPrint: string;
}

export interface IdempotencyResolveStatusData {
	operationName: IDEMPOTENCY_OPERATION;
	key: string;
	userId: string;
}

export type ResolveStatusResult<T> =
	| {
			type: IDEMPOTENCY_RESOLUTION_TYPE.REPLAY;
			responseBody: T;
			responseCode: number;
	  }
	| {
			type: IDEMPOTENCY_RESOLUTION_TYPE.EXECUTE;
			idempotency?: IdempotencyDocument;
	  };
