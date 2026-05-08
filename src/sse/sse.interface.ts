export interface SseEvent {
	data: any;
	id?: string;
	type?: string;
	retry?: number;
}
