import {
	IsArray,
	IsEnum,
	IsMongoId,
	IsOptional,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChannelsDto } from './channels.dto';
import { QuietHoursDto } from './quiet-hours.dto';
import { DigestDto } from './digest.dto';
import { NOTIFICATION_CATEGORY } from '../../notification/notification.constant';

export class CreateUserPreferenceDto {
	@IsMongoId()
	declare userId: string;

	@IsOptional()
	@ValidateNested()
	@Type(() => ChannelsDto)
	channels?: ChannelsDto;

	@IsOptional()
	@ValidateNested()
	@Type(() => QuietHoursDto)
	quietHours?: QuietHoursDto;

	@IsOptional()
	@ValidateNested()
	@Type(() => DigestDto)
	digest?: DigestDto;

	@IsOptional()
	@IsArray()
	@IsEnum(NOTIFICATION_CATEGORY, { each: true })
	mutedNotifCategories?: NOTIFICATION_CATEGORY[];
}
