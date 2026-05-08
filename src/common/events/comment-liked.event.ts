export interface CommentLikedEventData {
	commentId: string;
	likedBy: string;
	commentOwner: string;
}

export class CommentLikedEvent {
	constructor(public commentLikedEventData: CommentLikedEventData) {}
}
