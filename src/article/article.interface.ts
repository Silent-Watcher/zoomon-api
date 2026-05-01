import { SortValues } from 'mongoose';
import { SortEntity } from '../common/interfaces/api.interface';

export interface SortArticleObject extends SortEntity {
	createdAt?: SortValues;
	likesCount?: SortValues;
	commentsCount?: SortValues;
}

export type SortArticle = SortArticleObject | string;
