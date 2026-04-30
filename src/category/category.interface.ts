export interface ListAllOptions {
	page: number;
	limit: number;
	sort: any;
}

export interface SortCategory {
	createdAt: 'asc' | 'desc' | '1' | '-1';
	name: 'asc' | 'desc' | '1' | '-1';
}
