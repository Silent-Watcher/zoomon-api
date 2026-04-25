import { SetMetadata } from '@nestjs/common';

export const CACHE_WITH_ETAG_KEY = 'cacheWithEtag';

export function CacheWithEtag() {
	return SetMetadata(CACHE_WITH_ETAG_KEY, true);
}
