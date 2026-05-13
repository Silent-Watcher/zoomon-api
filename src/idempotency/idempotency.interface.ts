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
	targetResourceId: string;
}

export type ResolveStatusResult =
	| {
			type: IDEMPOTENCY_RESOLUTION_TYPE.REPLAY;
			responseBody: unknown;
			responseCode?: number;
	  }
	| {
			type: IDEMPOTENCY_RESOLUTION_TYPE.EXECUTE;
			idempotency?: IdempotencyDocument;
	  };
