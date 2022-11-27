import { dbPool } from '@database/pool';
import { baseObject, countObject } from '@database/base';
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

export type CategoryConnector = {
	create: (name: string) => Promise<Category>;
	update: (id: number, name: string) => Promise<Category | undefined>;
	getByName: (name: string) => Promise<Category | undefined>;
	deleteObjs: (ids: Array<number>, strictAmountCheck: boolean) => Promise<number>;
};

export const createCategoryConnector = (db: DatabasePool = dbPool): CategoryConnector => {
	const create = async (name: string) => {
		const raw = await db.query(sql.type(categoryObject)`INSERT INTO category (name) VALUES (${name}) RETURNING *;`);
		return raw.rows[0];
	};

	const update = async (id: number, name: string) => {
		const raw = await db.query(
			sql.type(categoryObject)`UPDATE category SET name = ${name} WHERE id = ${id} RETURNING *;`
		);
		return raw.rows[0];
	};

	const getByName = async (name: string) => {
		const raw = await db.query(sql.type(categoryObject)`SELECT * FROM category LIMIT 1 WHERE name = ${name};`);
		return raw.rows[0];
	};

	const deleteObjs = async (ids: Array<number>, strictAmountCheck: boolean) => {
		const uniqueIds = [...new Set(ids)];
		const expectedCount = uniqueIds.length;
		const raw = await db.query(sql.type(countObject)`DELETE FROM category WHERE id IN ${uniqueIds};`);
		const deletedCount = raw.rows[0].count;
		if (strictAmountCheck && expectedCount !== deletedCount) {
			throw new Error(
				`Actual objects be deleted (${deletedCount}) is different from the expectation (${expectedCount})`
			);
		}
		return deletedCount;
	};

	return {
		create,
		update,
		getByName,
		deleteObjs,
	};
};
