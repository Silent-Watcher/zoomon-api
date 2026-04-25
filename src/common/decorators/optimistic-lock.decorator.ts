import { SetMetadata } from '@nestjs/common';
import { OPTIMISTIC_LOCK_KEY } from '../constants/decorator.constant';

export function OptimisticLock() {
	return SetMetadata(OPTIMISTIC_LOCK_KEY, true);
}
