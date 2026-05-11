import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../user/decorators/user.decorator';
import { NOTIFICATION_CATEGORY } from '../notification/notification.constant';
import { DigestPeriod } from './user-preference.constant';

@Schema({
	toJSON: { virtuals: true },
	timestamps: true,
	id: true,
})
export class UserPreference {
	@Prop({
		type: Types.ObjectId,
		ref: User.name,
		required: true,
		unique: true,
	})
	declare userId: Types.ObjectId;

	@Prop(
		raw({
			sse: { type: Boolean, default: true },
			email: { type: Boolean, default: false },
			push: { type: Boolean, default: false },
			sms: { type: Boolean, default: false },
		}),
	)
	declare channels: Record<string, boolean>;

	@Prop(
		raw({
			enabled: { type: Boolean, default: false },
			start: { type: String, default: '22:00' },
			end: { type: String, default: '08:00' },
			timezone: { type: String, default: 'Asia/Tehran' },
			days: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
		}),
	)
	declare quietHours: Record<string, any>;

	@Prop(
		raw({
			enabled: { type: Boolean, default: false },
			period: {
				type: String,
				enum: Object.values(DigestPeriod),
				default: DigestPeriod.DAILY,
			},
			time: { type: String, default: '08:00' },
			timezone: { type: String, default: 'Asia/Tehran' },
			types: { type: [String], default: [] },
			lastSent: { type: Date, default: null },
		}),
	)
	declare digest: Record<string, any>;

	@Prop({
		type: [String],
		enum: {
			values: Object.values(NOTIFICATION_CATEGORY),
		},
		required: false,
		default: [],
	})
	mutedNotifCategories?: NOTIFICATION_CATEGORY[];

	declare _id: Types.ObjectId;
	declare id: string;

	declare createdAt: Date;
	declare updatedAt: Date;
}

export type UserPreferenceDocument = HydratedDocument<UserPreference>;
export const UserPreferenceSchema =
	SchemaFactory.createForClass(UserPreference);
