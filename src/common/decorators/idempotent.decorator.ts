import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENT_METATDATA_KEY = 'idempotent_metadata';

export const Idempotent = () => SetMetadata(IDEMPOTENT_METATDATA_KEY, true);
