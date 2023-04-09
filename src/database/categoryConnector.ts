import {
	CATEGORY_TABLE,
	deleteDbObjs,
	getDbPool,
	parseInsertingData,
	parseUpdatingData,
	SqlConnection,
} from "@database/index";
import { sql } from "slonik";
import { z } from "zod";
import { categoryObj, createCategoryObj, updateCategoryObj } from "@database/categoryObjects";

export type Category = z.output<typeof categoryObj>;

export type CategoryConnector = {
	create: (input: z.input<typeof createCategoryObj>) => Promise<Category>;
	update: (input: z.input<typeof updateCategoryObj>) => Promise<Category | undefined>;
	getAll: (name?: string, limit?: number, offset?: number) => Promise<Readonly<Array<Category>>>;
	getByName: (name: string) => Promise<Category | undefined>;
	deleteObjs: (ids: Array<number>) => Promise<number>;
};

export const createCategoryConnector = async (dbPool?: SqlConnection): Promise<CategoryConnector> => {
	const db = dbPool || (await getDbPool());

	const create = async (input: z.input<typeof createCategoryObj>) => {
		const { columns, values } = parseInsertingData(createCategoryObj, input);

		const raw = await db.query(
			sql.type(categoryObj)`INSERT INTO ${CATEGORY_TABLE} (${columns}) VALUES (${values}) RETURNING *;`
		);
		return raw.rows[0];
	};

	const update = async (input: z.input<typeof updateCategoryObj>) => {
		const { id, dataSetter } = parseUpdatingData(updateCategoryObj, input);

		const raw = await db.query(
			sql.type(categoryObj)`UPDATE ${CATEGORY_TABLE} SET ${dataSetter} WHERE id = ${id} RETURNING *;`
		);
		return raw.rows[0];
	};

	const getAll = async (name = "", limit = 10, offset = 0) => {
		const namePattern = `%${name}%`;
		const raw = await db.query(
			sql.type(
				categoryObj
			)`SELECT * FROM ${CATEGORY_TABLE} WHERE LOWER(name) LIKE ${namePattern} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset};`
		);
		return raw.rows;
	};

	const getByName = async (name: string) => {
		const raw = await db.query(
			sql.type(categoryObj)`SELECT * FROM ${CATEGORY_TABLE} WHERE name = ${name} LIMIT 1;`
		);
		return raw.rows[0];
	};

	const deleteObjs = async (ids: Array<number>) => await deleteDbObjs(db, CATEGORY_TABLE, ids);

	return {
		create,
		update,
		getAll,
		getByName,
		deleteObjs,
	};
};
