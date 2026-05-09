export interface SseEvent {
	data: any;
	id?: string;
	event?: string;
	retry?: number;
}
