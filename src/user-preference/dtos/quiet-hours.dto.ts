import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsIn,
	IsOptional,
	IsString,
} from 'class-validator';
import { IsTimeHHMM } from '../../common/validators/time.validator';

export class QuietHoursDto {
	@IsOptional()
	@IsBoolean()
	enabled?: boolean;

	@IsOptional()
	@IsTimeHHMM()
	start?: string;

	@IsOptional()
	@IsTimeHHMM()
	end?: string;

	@IsOptional()
	@IsString()
	timezone?: string;

	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(7)
	@IsIn([0, 1, 2, 3, 4, 5, 6], { each: true })
	days?: number[];
}
