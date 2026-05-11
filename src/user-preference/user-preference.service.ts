import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, QueryOptions } from 'mongoose';
import { UserPreference } from './user-preference.schema';
import { toMinutes } from '../common/helpers/date.helper';
import { NOTIFICATION_CATEGORY } from '../notification/notification.constant';
import { CreateUserPreferenceDto } from './dtos/create-user-preference.dto';

@Injectable()
export class UserPreferenceService {
	constructor(
		@InjectModel(UserPreference.name)
		private readonly userPreferenceModel: Model<UserPreference>,
	) {}

	async isInQuietHours(
		userId: string,
		date: Date,
		notifCategory: NOTIFICATION_CATEGORY,
	): Promise<{ result: boolean; delayUntilEnd?: number }> {
		const userPreference = await this.findById(
			userId,
			{ mutedNotifCategories: 1, quietHours: 1 },
			{ lean: true },
		);

		const mutedCategories = userPreference?.mutedNotifCategories;
		if (mutedCategories && mutedCategories.includes(notifCategory))
			return { result: true };

		if (userPreference?.quietHours.enabled) {
			const today = date.getDay();

			const { start, end } = userPreference.quietHours;
			const quietDays = userPreference.quietHours?.days;
			const [hour, minute] = [date.getHours(), date.getMinutes()];

			if (
				quietDays.includes(today) &&
				this.isQuietHours(`${hour}:${minute}`, start, end)
			) {
				return {
					result: true,
					delayUntilEnd: this.getDelayUntilQuietHoursEnd(
						`${hour}:${minute}`,
						end,
					),
				};
			}
		}

		return { result: false };
	}

	findById(
		userId: string,
		projection?: ProjectionType<UserPreference>,
		options?: QueryOptions,
	): Promise<UserPreference | null> {
		return this.userPreferenceModel.findById(userId, projection, options);
	}

	async createPreference(userId: string, createDto: CreateUserPreferenceDto) {
		const exists = await this.userPreferenceModel
			.findOne({ userId }, { _id: 1 })
			.lean();
		if (exists) throw new BadRequestException('preference already defined');

		await this.userPreferenceModel.create({
			userId,
		});
	}

	isQuietHours(
		time: `${number}:${number}`,
		start: `${number}:${number}`,
		end: `${number}:${number}`,
	): boolean {
		const t = toMinutes(time);
		const s = toMinutes(start);
		const e = toMinutes(end);

		if (s <= e) {
			return t >= s && t <= e;
		} else {
			return t >= s || t <= e;
		}
	}

	private getDelayUntilQuietHoursEnd(
		time: `${number}:${number}`,
		end: `${number}:${number}`,
	): number {
		const t = toMinutes(time);
		const e = toMinutes(end) + 1;

		return (e - t) * 60 * 1000; // minute -> ms
	}
}
