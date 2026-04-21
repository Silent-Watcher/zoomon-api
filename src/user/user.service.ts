import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import type {
	ClientSession,
	Model,
	ProjectionType,
	QueryFilter,
} from 'mongoose';
import { Identifier } from '../auth/auth.service';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) {}

	async findOneByIdentifier(
		identifier: string,
		projection?: ProjectionType<User>,
		lean: boolean = true,
		session?: ClientSession,
	) {
		const query: QueryFilter<User> = {
			$or: [{ email: identifier }, { phone: identifier }],
		};
		return this.userModel.findOne(query, projection ?? { _id: 1 }, {
			lean,
			session,
		});
	}

	async create(
		identifier: string,
		type: Identifier,
		session?: ClientSession,
	) {
		const query: Partial<User> =
			type === 'email' ? { email: identifier } : { phone: identifier };
		const newUser = new this.userModel(query);
		return newUser.save({ session });
	}
}
