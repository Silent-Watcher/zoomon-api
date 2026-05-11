import {
	IsArray,
	IsBoolean,
	IsDateString,
	IsEnum,
	IsOptional,
	IsString,
} from 'class-validator';

import { NOTIFICATION_CATEGORY } from '../../notification/notification.constant';
import { DigestPeriod } from '../user-preference.constant';
import { IsTimeHHMM } from '../../common/validators/time.validator';

export class DigestDto {
	@IsOptional()
	@IsBoolean()
	enabled?: boolean;

	@IsOptional()
	@IsEnum(DigestPeriod)
	period?: DigestPeriod;

	@IsOptional()
	@IsTimeHHMM()
	time?: string;

	@IsOptional()
	@IsString()
	timezone?: string;

	@IsOptional()
	@IsArray()
	@IsEnum(NOTIFICATION_CATEGORY, { each: true })
	types?: NOTIFICATION_CATEGORY[];

	@IsOptional()
	@IsDateString()
	lastSent?: Date | null;
}
