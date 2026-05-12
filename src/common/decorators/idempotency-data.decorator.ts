import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IDEMPOTENCY_CONTEXT_KEY } from '../constants/server.constant';
import { IdempotencyRequestData } from '../../idempotency/idempotency.interface';

export const IdempotencyData = createParamDecorator<
	keyof IdempotencyRequestData,
	IdempotencyRequestData
>((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	return data
		? request[IDEMPOTENCY_CONTEXT_KEY][data as keyof IdempotencyRequestData]
		: request[IDEMPOTENCY_CONTEXT_KEY];
});
