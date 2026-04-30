import {
	ArgumentMetadata,
	Injectable,
	NotAcceptableException,
	PipeTransform,
} from '@nestjs/common';
import z from 'zod';
import { MONGO_SORT_VALUES } from '../../common/constants/mongo.constant';
import { fromError } from 'zod-validation-error';

export const SortCategorySchema = z
	.object({
		createdAt: z.enum(MONGO_SORT_VALUES).optional(),
		name: z.enum(MONGO_SORT_VALUES).optional(),
	})
	.strict()
	.optional();

@Injectable()
export class SortCategoryPipe implements PipeTransform {
	transform(value: any, metadata: ArgumentMetadata) {
		if (metadata.type === 'query' && metadata.metatype === Object) {
			const parseResult = SortCategorySchema.safeParse(value);
			const errorMsg = fromError(parseResult.error).toString();
			if (!parseResult.success)
				throw new NotAcceptableException(`Query[Sort] ${errorMsg}`);
		}
		return value;
	}
}
