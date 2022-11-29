import { createPool, sql } from 'slonik';
import { APP_CONFIG } from '@src/config';

export const dbPool = await createPool(APP_CONFIG.DATABASE_URL || '');

const SCHEMA_NAME = 'e_learning_schema';
export const CATEGORY_TABLE = sql.identifier([SCHEMA_NAME, 'category']);
export const DIARY_TABLE = sql.identifier([SCHEMA_NAME, 'diary']);
export const NOTE_TABLE = sql.identifier([SCHEMA_NAME, 'note']);
