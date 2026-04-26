import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotAcceptableException,
	NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import type {
	ClientSession,
	Model,
	ProjectionType,
	QueryFilter,
} from 'mongoose';
import { Identifier } from '../auth/auth.service';
import {
	comparePassword,
	hashPassword,
} from '../common/helpers/password.helper';
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
		return this.userModel.findById(id, projection, {
			lean,
			session,
		});
	}

	// TODO: we can rate limit this path! with redis!
	async setPassword(
		newPassword: string,
		user: UserDocument,
		oldPassword?: string,
	) {
		const userOldPassword = user?.password;

		if (!userOldPassword && oldPassword)
			throw new BadRequestException(
				'the User has not set a password yet',
			);
		if (userOldPassword && !oldPassword)
			throw new BadRequestException(
				"the User's current password is required",
			);

		if (userOldPassword && oldPassword) {
			if (!comparePassword(oldPassword, userOldPassword))
				throw new NotAcceptableException('invalid password');
		}

		let hashedPassword = hashPassword(newPassword);

		const { modifiedCount, acknowledged } = await user.updateOne(
			{
				$set: { password: hashedPassword },
			},
			{ lean: true },
		);

		if (modifiedCount != 1 && !acknowledged) {
			throw new InternalServerErrorException(
				'operation failed try again',
			);
		}

		return { acknowledged };
	}

	async patchCurrentUser(user: UserDocument, jsonPatch: Operation[]) {
		const { bio, city, birthdate, displayName } = user;
		const doc = { bio, city, birthdate, displayName };

		validateJsonPatch(jsonPatch, doc);

		// ? you can use 'structuredClone' instead of 'JSON.parse(JSON.stringify(doc))'
		const docClone = JSON.parse(JSON.stringify(doc));
		const patchResult = jsonpatch.applyPatch<User>(
			docClone,
			jsonPatch,
		).newDocument;

		await validateInstanceWithDto(PatchUserDto, patchResult);

		const { acknowledged, modifiedCount } = await user.updateOne(
			{
				$set: {
					bio: patchResult.bio,
					birthdate: patchResult.birthdate,
					city: patchResult.city,
					displayName: patchResult.displayName,
				},
			},
			{ lean: true },
		);

		return { acknowledged, modifiedCount };
	}
}
