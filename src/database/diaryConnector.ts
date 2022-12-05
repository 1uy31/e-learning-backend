import {
	DIARY_TABLE,
	CATEGORY_TABLE,
	getDbPool,
	parseInsertingData,
	parseUpdatingData,
	SqlConnection,
	deleteDbObjs,
} from "@database/index";
import { sql } from "slonik";
import { z } from "zod";
import { diaryObj, createDiaryObj, updateDiaryObj } from "@database/diaryObjects";

export type Diary = z.output<typeof diaryObj>;

export type DiaryConnector = {
	create: (input: z.input<typeof createDiaryObj>) => Promise<Diary>;
	update: (input: z.input<typeof updateDiaryObj>) => Promise<Diary | undefined>;
	getByCategorizedTopic: (categoryName: string | null, topic: string) => Promise<Readonly<Array<Diary>>>;
	deleteObjs: (ids: Array<number>) => Promise<number>;
};

export const createDiaryConnector = async (dbPool?: SqlConnection): Promise<DiaryConnector> => {
	const db = dbPool || (await getDbPool());

	const create = async (input: z.input<typeof createDiaryObj>) => {
		const { columns, values } = parseInsertingData(createDiaryObj, input);

		const raw = await db.query(
			sql.type(diaryObj)`INSERT INTO ${DIARY_TABLE} (${columns}) VALUES (${values}) RETURNING *;`
		);
		return raw.rows[0];
	};

	const update = async (input: z.input<typeof updateDiaryObj>) => {
		const { id, dataSetter } = parseUpdatingData(updateDiaryObj, input);

		const raw = await db.query(
			sql.type(diaryObj)`UPDATE ${DIARY_TABLE} SET ${dataSetter} WHERE id = ${id} RETURNING *;`
		);
		return raw.rows[0];
	};

	const getByCategorizedTopic = async (categoryName: string | null, topic: string) => {
		if (categoryName === null) {
			const raw = await db.query(
				sql.type(diaryObj)`SELECT * FROM ${DIARY_TABLE} WHERE topic = ${topic} AND category_id IS NULL;`
			);
			return raw.rows;
		}

		const raw = await db.query(
			sql.type(
				diaryObj
			)`SELECT d.* FROM ${DIARY_TABLE} d LEFT JOIN ${CATEGORY_TABLE} c ON d.category_id = c.id WHERE d.topic = ${topic} AND c.name = ${categoryName};`
		);
		return raw.rows;
	};

	const deleteObjs = async (ids: Array<number>) => await deleteDbObjs(db, DIARY_TABLE, ids);

	return {
		create,
		update,
		getByCategorizedTopic,
		deleteObjs,
	};
};
