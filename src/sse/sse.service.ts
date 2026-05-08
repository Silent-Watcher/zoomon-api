import { Injectable } from '@nestjs/common';
import { filter, Observable, Subject } from 'rxjs';
import { SseEvent } from './sse.interface';

@Injectable()
export class SseService {
	private eventSubject = new Subject<SseEvent>();

	get events$(): Observable<SseEvent> {
		return this.eventSubject.asObservable();
	}

	userEvents$(userId: string): Observable<SseEvent> {
		return this.events$.pipe(
			filter((event) => event?.data?.userId == userId),
		);
	}

	emit(event: SseEvent): void {
		this.eventSubject.next(event);
	}
}
