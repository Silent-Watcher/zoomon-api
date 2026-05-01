import {
	ArgumentMetadata,
	Injectable,
	NotAcceptableException,
	PipeTransform,
} from '@nestjs/common';
import { ZodType } from 'zod';
import { fromError } from 'zod-validation-error';

export function sortPipe(schema: ZodType) {
	@Injectable()
	class SortCategoryPipe implements PipeTransform {
		transform(value: any, metadata: ArgumentMetadata) {
			if (metadata.type === 'query' && metadata.metatype === Object) {
				const parseResult = schema.safeParse(value);
				const errorMsg = fromError(parseResult.error).toString();
				if (!parseResult.success)
					throw new NotAcceptableException(`Query[Sort] ${errorMsg}`);
			}
			return value;
		}
	}
	return SortCategoryPipe;
}
