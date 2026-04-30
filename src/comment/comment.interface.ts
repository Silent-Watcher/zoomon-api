import { SortValues } from 'mongoose';

export interface SortComment {
	createdAt?: SortValues;
	likesCount?: SortValues;
	repliesCount?: SortValues;
}

export interface ListCommentsOpts {
	sort: SortComment;
}
