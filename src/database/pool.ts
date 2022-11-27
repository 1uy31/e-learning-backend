import { createPool } from 'slonik';
import { APP_CONFIG } from '@src/config';

export const dbPool = await createPool(APP_CONFIG.DATABASE_URL || '');
