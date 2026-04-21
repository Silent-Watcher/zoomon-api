import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { OtpModule } from '../otp/otp.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
	imports: [UserModule, OtpModule, LoggerModule],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
