import { IsBoolean, IsOptional } from 'class-validator';

export class ChannelsDto {
	@IsOptional()
	@IsBoolean()
	sse?: boolean;

	@IsOptional()
	@IsBoolean()
	email?: boolean;

	@IsOptional()
	@IsBoolean()
	push?: boolean;

	@IsOptional()
	@IsBoolean()
	sms?: boolean;
}
