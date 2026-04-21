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
import { v4 as uuidv4 } from 'uuid';

export enum OTP_STATUS {
	PENDING = 'pending',
	SENT = 'sent',
}

export interface Otp {
	code: string;
	id: string;
	status: OTP_STATUS;
}

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

	async createFor(identifier: string): Promise<string> {
		try {
			const key = `${this.keyPrefix}:${identifier}`;
			const keyExists = await this.redis.exists(key);

			if (keyExists) {
				throw new BadRequestException(
					`OTP for identifier : ${identifier} not expired!`,
				);
			}

			const code = Math.floor(100000 + Math.random() * 900000).toString();
			const rawOtp: Otp = {
				code,
				id: uuidv4(),
				status: OTP_STATUS.PENDING,
			};

			const otp = JSON.stringify(rawOtp);

			await this.redis.setex(key, this.ttlSec, JSON.stringify(otp));

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
