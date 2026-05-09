import { Inject, Injectable } from '@nestjs/common';
import { filter, Observable, Subject } from 'rxjs';
import { SseEvent } from './sse.interface';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import apiConfig from '../common/configs/api.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class SseService {
	private eventSubject = new Subject<SseEvent>();
	private connectionKeyPrefix: string;

	constructor(
		@InjectRedis() private readonly redis: Redis,
		@Inject(apiConfig.KEY)
		private readonly apiConf: ConfigType<typeof apiConfig>,
	) {
		this.connectionKeyPrefix = `${this.apiConf.appName}:user_online`;
	}

	get events$(): Observable<SseEvent> {
		return this.eventSubject.asObservable();
	}

	/** Emits an event to all subscribers */
	emit(event: SseEvent): void {
		this.eventSubject.next(event);
	}

	/** Returns an observable stream of events for a specific user */
	userEvents$(userId: string): Observable<SseEvent> {
		return new Observable<SseEvent>((subscriber) => {
			this.addConnection(userId.toString());

			const subscription = this.events$
				.pipe(filter((event) => event?.data?.userId === userId))
				.subscribe({
					next: (event) => subscriber.next(event),
					error: (err) => subscriber.error(err),
					complete: () => subscriber.complete(),
				});

			// Cleanup when client disconnects
			return () => {
				subscription.unsubscribe();
				this.removeConnection(userId.toString());
			};
		});
	}

	async isUserOnline(userId: string): Promise<boolean> {
		const redisKey = `${this.connectionKeyPrefix}:${userId}`;
		const result = await this.redis.exists(redisKey);
		return result === 1;
	}

	private addConnection(userId: string): Promise<number> {
		const redisKey = `${this.connectionKeyPrefix}:${userId}`;
		return this.redis.incr(redisKey);
	}

	private async removeConnection(userId: string) {
		const redisKey = `${this.connectionKeyPrefix}:${userId}`;
		const current = await this.redis.get(redisKey);
		if (Number(current) <= 1) await this.redis.del(redisKey);
		else await this.redis.decr(redisKey);
	}
}
