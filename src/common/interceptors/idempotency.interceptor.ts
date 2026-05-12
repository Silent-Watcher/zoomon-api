import { ApiUtil } from './../../util/api.util';
import {
	BadRequestException,
	CallHandler,
	ConflictException,
	ExecutionContext,
	Inject,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { finalize, Observable } from 'rxjs';
import { IDEMPOTENT_METATDATA_KEY } from '../decorators/idempotent.decorator';
import {
	IDEMPOTENCY_HEADER,
	IDEMPOTENCY_LOCK_KEY_EXPIRES_IN_SECONDS,
} from '../../idempotency/idempotency.constant';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import apiConfig from '../configs/api.config';
import type { ConfigType } from '@nestjs/config';
import { v4 as uuidV4 } from 'uuid';
import { IDEMPOTENCY_CONTEXT_KEY } from '../constants/server.constant';
import { AppLogger } from '../../logger/logger.service';
import { IdempotencyRequestData } from '../../idempotency/idempotency.interface';
import { Request } from 'express';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
	private readonly renewScript = `
		if redis.call("GET", KEYS[1]) == ARGV[1] then
			return redis.call("EXPIRE", KEYS[1], ARGV[2])
		else
			return 0
		end
	`;

	constructor(
		private readonly reflector: Reflector,
		@InjectRedis() private readonly redis: Redis,
		@Inject(apiConfig.KEY)
		private readonly apiConf: ConfigType<typeof apiConfig>,
		private readonly logger: AppLogger,
		private readonly apiUtil: ApiUtil,
	) {
		this.logger.setContext(IdempotencyInterceptor.name);
	}

	async intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Promise<Observable<any>> {
		const enabled = this.reflector.getAllAndOverride(
			IDEMPOTENT_METATDATA_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!enabled) {
			return next.handle();
		}

		const request = context.switchToHttp().getRequest<Request>();

		const idempotencyKey = request.headers[IDEMPOTENCY_HEADER] as
			| string
			| undefined;

		if (!idempotencyKey) {
			throw new BadRequestException('Idempotency key required!');
		}

		const idempotencyLockKey = `${this.apiConf.appName}:idemp:lock:${idempotencyKey}`;
		const lockTokenValue = uuidV4();

		const accuiredLock = await this.redis.set(
			idempotencyLockKey,
			lockTokenValue,
			'EX',
			IDEMPOTENCY_LOCK_KEY_EXPIRES_IN_SECONDS,
			'NX',
		);

		// lock already exists
		if (accuiredLock !== 'OK') {
			throw new ConflictException(
				'Another request with same idempotency key is in progress',
			);
		}

		const requestFingerPrint = this.apiUtil.createRequestSignature(request);

		request[IDEMPOTENCY_CONTEXT_KEY] = Object.freeze({
			lockToken: idempotencyLockKey,
			key: idempotencyKey,
			requestFingerPrint,
		}) satisfies IdempotencyRequestData;

		const renewIntervalMs =
			Math.floor(IDEMPOTENCY_LOCK_KEY_EXPIRES_IN_SECONDS / 3) * 1000;

		const renewIntervalsId = setInterval(async () => {
			try {
				const result = await this.redis.eval(
					this.renewScript,
					1,
					idempotencyLockKey,
					lockTokenValue,
					IDEMPOTENCY_LOCK_KEY_EXPIRES_IN_SECONDS,
				);

				if (result !== 1) {
					this.logger.warn(
						`Failed to renew idempotency lock for key=${idempotencyKey}`,
					);
				}
			} catch (error) {
				this.logger.error(
					`Heartbeat renewal failed for key=${idempotencyKey}`,
					error,
				);
			}
		}, renewIntervalMs);

		return next.handle().pipe(
			finalize(() => {
				clearInterval(renewIntervalsId);
			}),
		);
	}
}
