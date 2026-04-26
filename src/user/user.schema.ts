import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
	timestamps: true,
	versionKey: false,
	toJSON: { virtuals: true },
})
export class User {
	@Prop({
		required: false,
		trim: true,
		unique: true,
		index: true,
		sparse: true,
	})
	email?: string;

	@Prop({
		required: false,
		trim: true,
		unique: true,
		index: true,
		sparse: true,
	})
	phone?: string;

	@Prop({ required: false, trim: true, index: true, default: undefined })
	password?: string;

	@Prop({
		required: false,
		trim: true,
		index: true,
		default: function (this: UserDocument) {
			if (this?.email)
				return this.email.slice(0, this.email.indexOf('@'));
			return `user-${this._id.toHexString().slice(-5)}`;
		},
	})
	declare displayName: string;

	@Prop({ required: false, default: undefined })
	city?: string;

	@Prop({ required: false, default: undefined })
	birthdate?: Date;

	@Prop({ required: false, default: undefined })
	bio?: string;

	@Prop({
		required: true,
		default: 1,
	})
	declare version: number;

	declare updatedAt: Date;
	declare createdAt: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
