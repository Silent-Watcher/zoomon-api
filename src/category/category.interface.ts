import type { SortValues } from 'mongoose';

export interface ListAllOptions {
	page: number;
	limit: number;
	sort: any;
}
export interface SortCategory {
	createdAt: SortValues;
	name: SortValues;
}
