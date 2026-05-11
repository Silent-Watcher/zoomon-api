import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
} from 'class-validator';

export function IsTimeHHMM(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'isTimeHHMM',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					if (typeof value !== 'string') return false;

					return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
				},

				defaultMessage(args: ValidationArguments) {
					return `${args.property} must be a valid HH:mm time`;
				},
			},
		});
	};
}
