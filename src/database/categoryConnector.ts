import { dbPool } from '@database/pool';
import { baseObject } from '@database/base';
import { DatabasePool } from 'slonik/dist/src/types';
import { sql } from 'slonik';
import { z } from 'zod';

const categoryObject = baseObject
	.extend({
		name: z.string(),
	})
	.transform((data) => ({
		id: data.id,
		createdAt: new Date(data.created_at),
		updatedAt: data.updated_at ? new Date(data.updated_at) : null,
		name: data.name,
	}));

export type Category = z.output<typeof categoryObject>;

type CategoryCreateParams = {
	name: string;
};

export type CategoryConnector = {
	create: (input: CategoryCreateParams) => Promise<Category>;
};

export const createCategoryConnector = (db: DatabasePool = dbPool): CategoryConnector => {
	const create = async (input: CategoryCreateParams) => {
		const { name } = input;
		const raw = await db.query(sql.type(categoryObject)`INSERT INTO category (name) VALUES (${name} RETURNING *;`);
		return raw.rows[0];
	};

	return {
		create,
	};
};
