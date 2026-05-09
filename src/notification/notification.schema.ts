import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
	MAXIMUM_NOTIFICATION_BODY_LENGTH,
	MAXIMUM_NOTIFICATION_TITLE_LENGTH,
	NOTIFICATION_CATEGORY,
	NOTIFICATION_CHANNEL,
	NOTIFICATION_STATUS,
	NOTIFICATION_TYPE,
	NotificationChannels,
} from './notification.constant';
import { User } from '../user/decorators/user.decorator';

@Schema({
	id: true,
	toJSON: { virtuals: true },
	timestamps: true,
})
export class Notification {
	@Prop({ required: true, ref: User.name, index: true })
	declare recipientId: Types.ObjectId;

	@Prop({
		required: true,
		maxlength: MAXIMUM_NOTIFICATION_TITLE_LENGTH,
		trim: true,
	})
	declare title: string;

	@Prop({
		required: true,
		maxlength: MAXIMUM_NOTIFICATION_BODY_LENGTH,
		trim: true,
	})
	declare body: string;

	@Prop({
		type: [String],
		required: true,
		enum: { values: Object.values(NOTIFICATION_CHANNEL) },
		default: [NOTIFICATION_CHANNEL.IN_APP],
		index: true,
	})
	declare channels: NotificationChannels[];

	@Prop({
		required: true,
		enum: Object.values(NOTIFICATION_TYPE),
		default: NOTIFICATION_TYPE.ADMIN_BROADCAST,
		index: true,
	})
	declare type: NOTIFICATION_TYPE;

	@Prop({
		required: true,
		enum: Object.values(NOTIFICATION_CATEGORY),
		default: NOTIFICATION_CATEGORY.SOCIAL,
		index: true,
	})
	declare category: NOTIFICATION_CATEGORY;

	@Prop({
		required: true,
		default: NOTIFICATION_STATUS.PENDING,
		enum: Object.values(NOTIFICATION_STATUS),
		index: true,
	})
	declare status: NOTIFICATION_STATUS;

	@Prop({ type: Types.Map, of: String, required: false })
	metadata?: Record<string, any>;

	@Prop({
		required: function (this: NotificationDocument) {
			return this.status == NOTIFICATION_STATUS.READ;
		},
		default: undefined,
	})
	readAt?: Date;

	@Prop({
		required: function (this: NotificationDocument) {
			return this.status == NOTIFICATION_STATUS.SENT;
		},
		default: undefined,
	})
	sentAt?: Date;

	@Prop({
		required: function (this: NotificationDocument) {
			return this.status == NOTIFICATION_STATUS.FAILED;
		},
		default: undefined,
	})
	failureReason?: string;

	@Prop({ required: true, default: 0, min: 0 })
	declare retryCount: number;

	@Prop({
		required: true,
		default: 1,
	})
	declare version: number;

	@Prop({ required: false })
	expiresAt?: Date;

	declare _id: Types.ObjectId;
	declare id: string;

	declare createdAt: Date;
	declare updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);

// get user's notifications sorted by date
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

// unread count query
NotificationSchema.index({ recipientId: 1, status: 1 });
