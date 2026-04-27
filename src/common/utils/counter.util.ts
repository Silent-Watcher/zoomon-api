import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
	id: true,
	_id: false,
	timestamps: false,
})
export class Counter {
	@Prop({
		required: true,
		trim: true,
		toLowerCase: true,
		unique: true,
		index: true,
	})
	declare identifier: string;

	@Prop({ required: true, default: 0, min: 0, index: true })
	declare seq: number;
}

export type CounterDocument = HydratedDocument<Counter>;
export const CounterSchema = SchemaFactory.createForClass(Counter);
