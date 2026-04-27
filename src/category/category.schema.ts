import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
	toJSON: { virtuals: true },
	id: true,
	timestamps: true,
})
export class Category {
	declare id: string;
	declare createdAt: Date;
	declare updatedAt: Date;

	@Prop({ required: true, unique: true, index: true, trim: true })
	declare name: string;
}

export type CategoryDocument = HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);
