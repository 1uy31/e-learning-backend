import { dbPool, CATEGORY_TABLE } from '@database/index';
import { countObj } from '@database/baseObjects';
import { DatabasePool } from 'slonik/dist/src/types';
import { sql } from 'slonik';
import { z } from 'zod';
import { categoryObj, createCategoryObj, updateCategoryObj } from '@database/categoryObjects';

export type Category = z.output<typeof categoryObj>;

export type CategoryConnector = {
	create: (input: z.infer<typeof createCategoryObj>) => Promise<Category>;
	update: (input: z.infer<typeof updateCategoryObj>) => Promise<Category | undefined>;
	getByName: (name: string) => Promise<Category | undefined>;
	deleteObjs: (ids: Array<number>) => Promise<number>;
};

export const createCategoryConnector = (db: DatabasePool = dbPool): CategoryConnector => {
	const create = async (input: z.infer<typeof createCategoryObj>) => {
		createCategoryObj.parse(input);
		const identifiers = Object.keys(input).map((key) => sql.identifier([key]));
		const columns = sql.join(identifiers, sql.fragment`, `);
		const values = sql.join(Object.values(input), sql.fragment`, `);
		const raw = await db.query(
			sql.type(categoryObj)`INSERT INTO ${CATEGORY_TABLE} (${columns}) VALUES (${values}) RETURNING *;`
		);
		return raw.rows[0];
	};

	const update = async (input: z.infer<typeof updateCategoryObj>) => {
		updateCategoryObj.parse(input);
		const { id, ...restOfInput } = input;
		const keysToUpdate = Object.entries(restOfInput)
			.filter((item) => item[1])
			.map((item) => item[0]);

		const valuesToUpdate = Object.entries(restOfInput)
			.filter((item) => item[1])
			.map((item) => item[1]);

		const setData = sql.join(
			keysToUpdate.map((column, idx) => {
				return sql.fragment`${sql.identifier([column])} = ${valuesToUpdate[idx]}`;
			}),
			sql.fragment`,`
		);

		const raw = await db.query(
			sql.type(categoryObj)`UPDATE ${CATEGORY_TABLE} SET ${setData} WHERE id = ${id} RETURNING *;`
		);
		return raw.rows[0];
	};

	const getByName = async (name: string) => {
		const raw = await db.query(
			sql.type(categoryObj)`SELECT * FROM ${CATEGORY_TABLE} LIMIT 1 WHERE name = ${name};`
		);
		return raw.rows[0];
	};

	const deleteObjs = async (ids: Array<number>) => {
		const uniqueIds = [...new Set(ids)];
		const raw = await db.query(sql.type(countObj)`DELETE FROM ${CATEGORY_TABLE} WHERE id IN ${uniqueIds};`);
		return raw.rows[0].count;
	};

	return {
		create,
		update,
		getByName,
		deleteObjs,
	};
};
