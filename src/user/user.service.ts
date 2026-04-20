import { Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, ProjectionType, QueryFilter } from 'mongoose';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) {}

	async findOneByIdentifier(
		identifier: string,
		projection?: ProjectionType<User>,
	): Promise<User | null> {
		const query: QueryFilter<User> = {
			$or: [{ email: identifier }, { phone: identifier }],
		};
		return this.userModel.findOne(query, projection ?? { _id: 1 }).lean();
	}
}
