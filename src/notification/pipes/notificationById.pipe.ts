import {
	Model,
	PopulateOptions,
	ProjectionType,
	QueryFilter,
	QueryOptions,
} from 'mongoose';
import { Notification } from '../notification.schema';
import {
	ArgumentMetadata,
	Inject,
	Injectable,
	NotFoundException,
	PipeTransform,
	Scope,
	Type,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NOTIFICATION_STATUS } from '../notification.constant';
import { REQUEST } from '@nestjs/core';
import {
	DATA_CONTEXT_KEY,
	USER_CONTEXT_KEY,
} from '../../common/constants/server.constant';

interface NotificationByIdPipeOptions {
	projection?: ProjectionType<Notification>;
	queryOptions?: QueryOptions<Notification>;
	populate?: PopulateOptions | PopulateOptions[];
	additionalFilter?: QueryFilter<Notification>;
}

export function notificationByIdPipe(
	config?: NotificationByIdPipeOptions,
): Type<PipeTransform> {
	@Injectable({ scope: Scope.REQUEST })
	class NotificationByIdPipe implements PipeTransform {
		constructor(
			@InjectModel(Notification.name)
			private readonly notificationModel: Model<Notification>,
			@Inject(REQUEST)
			private readonly request: Request,
		) {}

		async transform(value: any, metadata: ArgumentMetadata) {
			if (
				metadata.type === 'param' &&
				['parentId', 'id'].includes(metadata?.data!)
			) {
				const { projection, queryOptions, populate, additionalFilter } =
					config ?? {};

				const currentUser =
					this.request[DATA_CONTEXT_KEY][USER_CONTEXT_KEY];
				const baseFilter: QueryFilter<Notification> = {
					_id: value,
					recipientId: currentUser.id,
					status: {
						$in: [
							NOTIFICATION_STATUS.DELIVERED,
							NOTIFICATION_STATUS.SENT,
						],
					},
					$or: [
						{ expiresAt: { $exists: false } },
						{ expiresAt: { $gt: new Date() } },
					],
				};

				const filter = additionalFilter
					? { $and: [baseFilter, additionalFilter] }
					: baseFilter;

				let query = this.notificationModel.findOne(
					filter,
					projection ?? { version: 0, __v: 0 },
					queryOptions ?? { lean: true },
				);

				if (populate) {
					query = query.populate(populate);
				}

				const foundedNotification = await query.exec();

				if (!foundedNotification)
					throw new NotFoundException(
						`${Notification.name} not found`,
					);
				return foundedNotification;
			}
			return value;
		}
	}

	return NotificationByIdPipe;
}
