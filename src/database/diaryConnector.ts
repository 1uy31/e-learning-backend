import { DIARY_TABLE, CATEGORY_TABLE, getDbPool, parseInsertingData, parseUpdatingData } from "@database/index";
import { countObj } from "@database/baseObjects";
import { DatabasePool } from "slonik/dist/src/types";
import { sql } from "slonik";
import { z } from "zod";
import { diaryObj, createDiaryObj, updateDiaryObj } from "@database/diaryObjects";

export type Diary = z.output<typeof diaryObj>;

export type DiaryConnector = {
	create: (input: z.infer<typeof createDiaryObj>) => Promise<Diary>;
	update: (input: z.infer<typeof updateDiaryObj>) => Promise<Diary | undefined>;
	getByCategorizedTopic: (categoryName: string | null, topic: string) => Promise<Diary | undefined>;
	deleteObjs: (ids: Array<number>) => Promise<number>;
};

export const createDiaryConnector = async (dbPool?: DatabasePool): Promise<DiaryConnector> => {
	const db = dbPool || (await getDbPool());
	const create = async (input: z.infer<typeof createDiaryObj>) => {
		const { columns, values } = parseInsertingData(createDiaryObj, input);

		const raw = await db.query(
			sql.type(diaryObj)`INSERT INTO ${DIARY_TABLE} (${columns}) VALUES (${values}) RETURNING *;`
		);
		return raw.rows[0];
	};

	const update = async (input: z.infer<typeof updateDiaryObj>) => {
		const { id, dataSetter } = parseUpdatingData(updateDiaryObj, input);

		const raw = await db.query(
			sql.type(diaryObj)`UPDATE ${DIARY_TABLE} SET ${dataSetter} WHERE id = ${id} RETURNING *;`
		);
		return raw.rows[0];
	};

	const getByCategorizedTopic = async (categoryName: string | null, topic: string) => {
		let query = `SELECT * FROM ${DIARY_TABLE} WHERE topic = ${topic} AND category_id IS NULL;`;
		if (categoryName !== null) {
			query = `SELECT * FROM ${DIARY_TABLE} d INNER JOIN ${CATEGORY_TABLE} c WHERE d.topic = ${topic} AND c.name = ${categoryName} LIMIT 1;`;
		}
		const raw = await db.query(sql.type(diaryObj)`${query}`);
		return raw.rows[0];
	};

	const deleteObjs = async (ids: Array<number>) => {
		const uniqueIds = [...new Set(ids)];
		const raw = await db.query(
			sql.type(countObj)`
			WITH deleted AS (
			    DELETE FROM ${DIARY_TABLE} WHERE id IN (${sql.join(uniqueIds, sql.fragment`, `)}) 
				RETURNING *
			) SELECT COUNT(*) FROM deleted;
			`
		);
		return raw.rows[0].count;
	};

	return {
		create,
		update,
		getByCategorizedTopic,
		deleteObjs,
	};
};
