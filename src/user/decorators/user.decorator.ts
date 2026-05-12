import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
	DATA_CONTEXT_KEY,
	USER_CONTEXT_KEY,
} from '../../common/constants/server.constant';
import { User as UserEntity } from '../user.schema';

export const User = createParamDecorator<keyof UserEntity, Partial<UserEntity>>(
	(data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const user = request[DATA_CONTEXT_KEY][USER_CONTEXT_KEY];
		return data ? user?.[data as typeof User] : user;
	},
);
