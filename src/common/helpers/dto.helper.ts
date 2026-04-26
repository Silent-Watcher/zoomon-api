import { BadRequestException, Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

interface DtoValidationError {
	message: string;
	details: ({
		property: string;
		value: string;
		constraints:
			| {
					[type: string]: string;
			  }
			| undefined;
	} | null)[];
}

export async function validateInstanceWithDto(
	dto: Type<any>,
	input: Object,
): Promise<void> {
	const instance = plainToInstance(dto, input);

	const validationErrors = await validate(instance, {
		whitelist: true,
	});

	if (validationErrors.length == 0) return;

	const errorResult = normalizeDtoValidationErrors(validationErrors);

	throw new BadRequestException(errorResult);
}

function normalizeDtoValidationErrors(
	errors: ValidationError[],
): DtoValidationError | void {
	if (errors.length == 0) return;

	const errorResult: DtoValidationError = {
		message: 'invalid data type',
		details: [],
	};

	for (const error of errors) {
		const { value, property, constraints } = error;
		errorResult.details?.push({ property, value, constraints });
	}

	return errorResult;
}
