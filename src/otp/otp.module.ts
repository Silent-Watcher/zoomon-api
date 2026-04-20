import { Module } from '@nestjs/common';
import { OtpRedisModule } from './redis-otp.module';
import { OtpService } from './otp.service';

@Module({
	imports: [OtpRedisModule],
	providers: [OtpService],
	exports: [OtpService],
})
export class OtpModule {}
