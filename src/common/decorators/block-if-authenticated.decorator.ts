import { SetMetadata } from '@nestjs/common';

export const BLOCK_IF_AUTHENTICATED_KEY = 'block_if_authenticated_key';

export const BlockIfAuthenticated = () =>
	SetMetadata(BLOCK_IF_AUTHENTICATED_KEY, true);
