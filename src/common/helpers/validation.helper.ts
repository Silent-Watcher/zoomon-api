import z, { ZodObject } from 'zod';
import { fromError } from 'zod-validation-error';

export function validateSchemaAndReturnData<TSchema extends ZodObject, TData>(
	schema: TSchema,
	data: TData,
): TData & z.output<TSchema> {
	const parseResult = schema.safeParse(data);

	if (!parseResult.success) {
		throw new Error(
			`Config validation error: ${fromError(parseResult.error).toString()}`,
		);
	}

	return { ...data, ...parseResult.data };
}
