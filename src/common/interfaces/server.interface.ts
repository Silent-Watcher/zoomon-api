import { Response } from 'express';

export interface ApiResponse extends Response {
	data?: unknown;
	message?: string;
	meta?: unknown;
	apiVersion?: string;
	timestamp?: string;
	path?: string;
	reqId?: string;
	duration?: string;
}
