import type { SortValues } from 'mongoose';
import { SortEntity } from '../common/interfaces/api.interface';

export interface SortCategory extends SortEntity {
	createdAt: SortValues;
	name: SortValues;
}
