import z from 'zod';
import { MONGO_SORT_VALUES } from '../../common/constants/mongo.constant';

export const SortCategorySchema = z
	.object({
		createdAt: z.enum(MONGO_SORT_VALUES).optional(),
		name: z.enum(MONGO_SORT_VALUES).optional(),
	})
	.strict()
	.optional();
