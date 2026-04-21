import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { OTP_REDIS } from './redis-otp.module';
import type { ConfigType } from '@nestjs/config';
import apiConfig from '../common/configs/api.config';
import { OTP_TTL_SEC } from './otp.constant';

@Injectable()
export class OtpService {
	private readonly keyPrefix: string;
	private readonly ttlSec = OTP_TTL_SEC; // 2 minutes

	constructor(
		@Inject(OTP_REDIS) private readonly redis: Redis,
		@Inject(apiConfig.KEY)
		private readonly apiConf: ConfigType<typeof apiConfig>,
	) {
		this.keyPrefix = `${this.apiConf.appName}:account:otp`;
	}

	async createFor(identifier: string) {
		try {
			const otp = Math.floor(100000 + Math.random() * 900000).toString();

			const key = `${this.keyPrefix}:${identifier}`;
			const keyExists = await this.redis.exists(key);

			if (keyExists) {
				throw new BadRequestException(
					`OTP for identifier : ${identifier} not expired!`,
				);
			}

			await this.redis.setex(key, this.ttlSec, otp);

			return otp;
		} catch (error) {
			throw new InternalServerErrorException('something went wrong');
		}
	}

	fetch(identifier: string): Promise<string | null> {
		const key = `${this.keyPrefix}:${identifier}`;
		return this.redis.get(key);
	}

	getDel(identifier: string) {
		const key = `${this.keyPrefix}:${identifier}`;
		return this.redis.getdel(key);
	}

	del(identifier: string) {
		const key = `${this.keyPrefix}:${identifier}`;
		return this.redis.del(key);
	}
}
