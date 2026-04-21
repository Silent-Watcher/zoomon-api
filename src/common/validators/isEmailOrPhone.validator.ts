import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { emailRegex, phoneRegex } from '../constants/regex';

@ValidatorConstraint({ name: 'isEmailOrPhone', async: false })
export class IsEmailOrPhoneConstraint implements ValidatorConstraintInterface {
	validate(
		value: string,
		_validationArguments?: ValidationArguments,
	): Promise<boolean> | boolean {
		if (typeof value !== 'string') return false;

		const validEmail = emailRegex.test(value);
		const validPhone = phoneRegex.test(value);

		if (!validEmail && !validPhone) return false;
		return true;
	}
	defaultMessage?(_validationArguments?: ValidationArguments): string {
		throw new Error('identifier must be a valid email or phone number');
	}
}

export function IsEmailOrPhone(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: 'isEmailOrPhone',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: IsEmailOrPhoneConstraint,
		});
	};
}
