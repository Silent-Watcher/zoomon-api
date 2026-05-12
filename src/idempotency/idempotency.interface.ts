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
