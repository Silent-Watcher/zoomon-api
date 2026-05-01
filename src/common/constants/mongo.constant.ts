export const MONGO_SERVER_SELECTION_TIMEOUT_MS = 2000;
export const MONGO_SORT_VALUES = [
	'-1',
	'1',
	'asc',
	'ascending',
	'desc',
	'descending',
] as const;

export enum MONGODB_ERROR_CODES {
	DUPLICATE_KEY = 11000,
}
