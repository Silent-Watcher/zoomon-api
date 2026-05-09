export interface CommentLikedEventData {
	commentId: string;
	commentOwner: string;
	commentContent: string;
	entityId: string;
	entityContent: string;
	entityType: string;
}

export class CommentLikedEvent {
	constructor(public commentLikedEventData: CommentLikedEventData) {}
}
