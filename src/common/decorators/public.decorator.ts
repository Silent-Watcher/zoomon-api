import { SetMetadata } from '@nestjs/common';

export const PUBLIC_METADATA_KEY = 'public_key';

export const Public = () => SetMetadata(PUBLIC_METADATA_KEY, true);
