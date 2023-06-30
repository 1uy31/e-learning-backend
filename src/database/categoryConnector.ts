import {
	CATEGORY_TABLE,
	DIARY_TABLE,
	deleteDbObjs,
	getDbPool,
	parseInsertingData,
	parseUpdatingData,
	SqlConnection,
} from "@database/index";
import { sql } from "slonik";
import { z } from "zod";
import { categoryObj, extendedCategoryObj, createCategoryObj, updateCategoryObj } from "@database/categoryObjects";

export type Category = z.output<typeof categoryObj>;
export type ExtendedCategory = z.output<typeof extendedCategoryObj>;

export type CategoryConnector = {
	create: (input: z.input<typeof createCategoryObj>) => Promise<Category>;
	update: (input: z.input<typeof updateCategoryObj>) => Promise<Category | undefined>;
	getAll: (
		name?: string,
		limit?: number,
		offset?: number
	) => Promise<{ total: number; categories: Readonly<Array<ExtendedCategory>> }>;
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
		const namePattern = `%${name.toLowerCase()}%`;
		const countQueryResult = await db.query(
			sql.type(
				z.object({ count: z.number().gte(0) })
			)`SELECT COUNT(*) FROM ${CATEGORY_TABLE} WHERE LOWER(name) LIKE ${namePattern};`
		);
		const categoriesQueryResult = await db.query(
			sql.type(
				extendedCategoryObj
			)`SELECT c.*, COUNT(d.*) AS diary_count FROM ${CATEGORY_TABLE} c LEFT JOIN ${DIARY_TABLE} d 
    			ON d.category_id = c.id WHERE LOWER(c.name) LIKE ${namePattern} 
				GROUP BY c.id ORDER BY c.id ASC LIMIT ${limit} OFFSET ${offset};`
		);
		return { total: countQueryResult.rows[0].count, categories: categoriesQueryResult.rows };
	};

	const deleteObjs = async (ids: Array<number>) => await deleteDbObjs(db, CATEGORY_TABLE, ids);

	return {
		create,
		update,
		getAll,
		deleteObjs,
	};
};
