import { createPool } from 'slonik';
import { APP_CONFIG } from '@src/config';

export const dbPool = createPool(APP_CONFIG.DATABASE_URL || '');
