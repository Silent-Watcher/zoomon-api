import {
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { OTP_REDIS } from './redis-otp.module';
import type { ConfigType } from '@nestjs/config';
import apiConfig from '../common/configs/api.config';

@Injectable()
export class OtpService {
	private readonly keyPrefix: string;
	private readonly ttlSec = 120; // 2 minutes

	constructor(
		@Inject(OTP_REDIS) private readonly redis: Redis,
		@Inject(apiConfig.KEY)
		private readonly apiConf: ConfigType<typeof apiConfig>,
	) {
		this.keyPrefix = `${this.apiConf.appName}:account:otp`;
	}

	async issueOtp(identifier: string) {
		try {
			const otp = Math.floor(100000 + Math.random() * 900000).toString();

			const key = `${this.keyPrefix}:${identifier}`;
			const keyExists = await this.redis.exists(key);

			if (keyExists) {
				return await this.redis.get(key);
			}

			await this.redis.setex(key, this.ttlSec, otp);

			return otp;
		} catch (error) {
			throw new InternalServerErrorException('something went wrong');
		}
	}

	async verifyOtp(otp: string): Promise<string | null> {
		const storedOtp = await this.redis.getdel(otp);
		return storedOtp;
	}
}
