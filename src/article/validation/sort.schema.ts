import z from 'zod';
import { MONGO_SORT_VALUES } from '../../common/constants/mongo.constant';
import { SORT_ARTICLE_SPECS } from '../article.constant';

export const sortArticleSchema = z
	.union([
		z
			.object({
				createdAt: z.enum(MONGO_SORT_VALUES).optional(),
				likesCount: z.enum(MONGO_SORT_VALUES).optional(),
				commentsCount: z.enum(MONGO_SORT_VALUES).optional(),
			})
			.strict()
			.optional(),
		z.enum(Object.values(SORT_ARTICLE_SPECS)).optional(),
	])
	.optional();
