import { Injectable } from '@nestjs/common';
import { filter, Observable, Subject } from 'rxjs';
import { SseEvent } from './sse.interface';

@Injectable()
export class SseService {
	private eventSubject = new Subject<SseEvent>();
	private activeConnections = new Map<string, number>();

	get events$(): Observable<SseEvent> {
		return this.eventSubject.asObservable();
	}

	/** Emits an event to all subscribers */
	emit(event: SseEvent): void {
		this.eventSubject.next(event);
	}

	/** Check if a user currently has an active SSE connection */
	hasConnection(userId: string): boolean {
		return (this.activeConnections.get(userId) ?? 0) > 0;
	}

	/** Returns an observable stream of events for a specific user */
	userEvents$(userId: string): Observable<SseEvent> {
		return new Observable<SseEvent>((subscriber) => {
			this.addConnection(userId);

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
				this.removeConnection(userId);
			};
		});
	}

	private addConnection(userId: string) {
		const current = this.activeConnections.get(userId) ?? 0;
		this.activeConnections.set(userId, current + 1);
	}

	private removeConnection(userId: string) {
		const current = this.activeConnections.get(userId) ?? 0;
		if (current <= 1) this.activeConnections.delete(userId);
		else this.activeConnections.set(userId, current - 1);
	}
}
