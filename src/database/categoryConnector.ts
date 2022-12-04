import { CATEGORY_TABLE, getDbPool, parseInsertingData, parseUpdatingData } from "@database/index";
import { countObj } from "@database/baseObjects";
import { DatabasePool, DatabasePoolConnection } from "slonik/dist/src/types";
import { sql } from "slonik";
import { z } from "zod";
import { categoryObj, createCategoryObj, updateCategoryObj } from "@database/categoryObjects";

export type Category = z.output<typeof categoryObj>;

export type CategoryConnector = {
	create: (input: z.infer<typeof createCategoryObj>) => Promise<Category>;
	update: (input: z.infer<typeof updateCategoryObj>) => Promise<Category | undefined>;
	getByName: (name: string) => Promise<Category | undefined>;
	deleteObjs: (ids: Array<number>) => Promise<number>;
};

export const createCategoryConnector = async (
	dbPool?: DatabasePool | DatabasePoolConnection
): Promise<CategoryConnector> => {
	const db = dbPool || (await getDbPool());

	const create = async (input: z.infer<typeof createCategoryObj>) => {
		const { columns, values } = parseInsertingData(createCategoryObj, input);

		const raw = await db.query(
			sql.type(categoryObj)`INSERT INTO ${CATEGORY_TABLE} (${columns}) VALUES (${values}) RETURNING *;`
		);
		return raw.rows[0];
	};

	const update = async (input: z.infer<typeof updateCategoryObj>) => {
		const { id, dataSetter } = parseUpdatingData(updateCategoryObj, input);

		const raw = await db.query(
			sql.type(categoryObj)`UPDATE ${CATEGORY_TABLE} SET ${dataSetter} WHERE id = ${id} RETURNING *;`
		);
		return raw.rows[0];
	};

	const getByName = async (name: string) => {
		const raw = await db.query(
			sql.type(categoryObj)`SELECT * FROM ${CATEGORY_TABLE} WHERE name = ${name} LIMIT 1;`
		);
		return raw.rows[0];
	};

	const deleteObjs = async (ids: Array<number>) => {
		const uniqueIds = [...new Set(ids)];
		const raw = await db.query(
			sql.type(countObj)`
			WITH deleted AS (
			    DELETE FROM ${CATEGORY_TABLE} WHERE id IN (${sql.join(uniqueIds, sql.fragment`, `)}) 
				RETURNING *
			) SELECT COUNT(*) FROM deleted;
			`
		);
		return raw.rows[0].count;
	};

	return {
		create,
		update,
		getByName,
		deleteObjs,
	};
};
