import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import type {
	ClientSession,
	Model,
	ProjectionType,
	QueryFilter,
} from 'mongoose';
import { Identifier } from '../auth/auth.service';
import { hashPassword } from '../common/helpers/password.helper';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) {}

	findOneByIdentifier(
		identifier: string,
		projection?: ProjectionType<User>,
		lean: boolean = true,
		session?: ClientSession,
	) {
		const query: QueryFilter<User> = {
			$or: [{ email: identifier }, { phone: identifier }],
		};
		return this.userModel.findOne(query, projection, {
			lean,
			session,
		});
	}

	create(identifier: string, type: Identifier, session?: ClientSession) {
		const query: Partial<User> =
			type === 'email' ? { email: identifier } : { phone: identifier };
		const newUser = new this.userModel(query);
		return newUser.save({ session });
	}

	findById(
		id: string,
		projection?: ProjectionType<User>,
		lean: boolean = true,
		session?: ClientSession,
	) {
		return this.userModel.findById(id, projection ?? { password: 0 }, {
			lean,
			session,
		});
	}

	async setPassword(password: string, userId: string) {
		let hashedPassword = hashPassword(password);

		const result = await this.userModel.findByIdAndUpdate(
			userId,
			{
				$set: { password: hashedPassword },
			},
			{ returnDocument: 'after', projection: { updatedAt: 1 } },
		);

		if (!result) {
			throw new NotFoundException('User not found');
		}

		return result;
	}
}
