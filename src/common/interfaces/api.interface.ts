import type { SortValues } from 'mongoose';

export interface SortEntity {
	createdAt?: SortValues;
}

export interface ListAllOptions<S extends SortEntity | string> {
	page?: number;
	cursor?: string;
	limit?: number;
	sort?: string | S;
}
