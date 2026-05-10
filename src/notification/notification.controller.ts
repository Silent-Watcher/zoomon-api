import { Controller, Param, Patch } from '@nestjs/common';
import { notificationByIdPipe } from './pipes/notificationById.pipe';
import type { NotificationDocument } from './notification.schema';
import { NotificationService } from './notification.service';
import { User } from '../user/decorators/user.decorator';

@Controller('notifications')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Patch('/read-all')
	markAllNotificationsAsRead(@User('id') userId: string) {
		return this.notificationService.markAllNotificationsAsRead(userId);
	}

	@Patch(':id')
	markNotificationAsRead(
		@Param(
			'id',
			notificationByIdPipe({
				queryOptions: { lean: false },
			}),
		)
		notification: NotificationDocument,
	) {
		return this.notificationService.markNotificationAsRead(notification);
	}
}
