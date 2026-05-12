import {
	IsString,
	IsNotEmpty,
	IsMongoId,
	IsEnum,
	Min,
	IsOptional,
	IsObject,
	IsDateString,
	IsInt,
	ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HttpStatus } from '@nestjs/common';
import { IDEMPOTENCY_STATUS } from '../idempotency.constant';

export class CreateIdempotencyDto {
	@IsString()
	@IsNotEmpty()
	declare key: string;

	@IsString()
	@IsNotEmpty()
	declare requestFingerPrint: string;

	@ValidateIf((o) => o.status !== IDEMPOTENCY_STATUS.IN_PROGRESS)
	@IsEnum(HttpStatus)
	@IsNotEmpty()
	responseCode?: HttpStatus;

	@ValidateIf((o) => o.status !== IDEMPOTENCY_STATUS.IN_PROGRESS)
	@IsString()
	@IsNotEmpty()
	responseBody?: string;

	@IsEnum(IDEMPOTENCY_STATUS)
	@IsOptional()
	status?: IDEMPOTENCY_STATUS = IDEMPOTENCY_STATUS.IN_PROGRESS;

	@IsString()
	@IsNotEmpty()
	declare operationName: string;

	@IsMongoId()
	@IsOptional()
	targetResourceId?: string;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	@IsOptional()
	attemptCount?: number = 0;

	@IsString()
	@IsOptional()
	errorType?: string;

	@IsObject()
	@IsOptional()
	HeadersToReplay?: Record<string, any>;

	@IsOptional()
	@IsDateString()
	expiresAt?: string;
}
