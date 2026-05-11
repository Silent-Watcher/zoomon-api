import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { OtpModule } from '../otp/otp.module';
import { LoggerModule } from '../logger/logger.module';
import { SseModule } from '../sse/sse.module';
import { NotificationModule } from '../notification/notification.module';
import { UserPreferenceModule } from '../user-preference/user-preference.module';

@Module({
	imports: [
		UserModule,
		OtpModule,
		LoggerModule,
		SseModule,
		NotificationModule,
		UserPreferenceModule,
	],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
