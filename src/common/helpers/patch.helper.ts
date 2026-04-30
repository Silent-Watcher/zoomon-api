import { BadRequestException } from '@nestjs/common';
import { Operation, validate } from 'fast-json-patch';

export function validateJsonPatch<T>(jsonSchema: Operation[], doc: T): void {
	const errors = validate<T>(jsonSchema, doc);
	console.log('errors: ', errors);

	if (errors) {
		throw new BadRequestException({
			message: 'Invalid operation name',
			name: errors.name,
			operation: errors.operation,
		});
	}

	return;
}
