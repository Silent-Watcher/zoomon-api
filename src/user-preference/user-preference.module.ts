import { Module } from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserPreference, UserPreferenceSchema } from './user-preference.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: UserPreference.name, schema: UserPreferenceSchema },
		]),
	],
	providers: [UserPreferenceService],
	exports: [UserPreferenceService],
})
export class UserPreferenceModule {}
