import { Module } from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';

@Module({
	providers: [UserPreferenceService],
})
export class UserPreferenceModule {}
