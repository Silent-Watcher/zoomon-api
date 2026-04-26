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
import { OptimisticLockableService } from '../common/interfaces/optimistic-lockable.interface';
import { Operation } from 'fast-json-patch';
import jsonpatch from 'fast-json-patch';
import { PatchUserDto } from './dtos/patch-user.dto';
import { validateInstanceWithDto } from '../common/helpers/dto.helper';
import { validateJsonPatch } from '../common/helpers/patch.helper';

@Injectable()
export class UserService implements OptimisticLockableService {
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

		if (!result) throw new NotFoundException('User not found');

		return result;
	}

	async patchCurrentUser(userId: string, jsonPatch: Operation[]) {
		const userDoc = await this.findById(
			userId,
			{
				bio: 1,
				city: 1,
				birthdata: 1,
				displayName: 1,
			},
			false,
		);

		if (!userDoc) throw new NotFoundException('User not found');

		validateJsonPatch(jsonPatch, userDoc);

		// ? you can use 'structuredClone' instead of 'JSON.parse(JSON.stringify(userDoc))'
		const userDocClone = JSON.parse(JSON.stringify(userDoc));
		const patchResult = jsonpatch.applyPatch<User>(
			userDocClone,
			jsonPatch,
		).newDocument;

		await validateInstanceWithDto(PatchUserDto, patchResult);

		const { acknowledged, modifiedCount } = await userDoc.updateOne(
			{
				$set: {
					bio: patchResult.bio,
					birthdata: patchResult,
					city: patchResult.city,
					displayName: patchResult.displayName,
				},
			},
			{ lean: true },
		);

		return { acknowledged, modifiedCount };
	}
}
