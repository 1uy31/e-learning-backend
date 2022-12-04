import { DIARY_TABLE, CATEGORY_TABLE, getDbPool, parseInsertingData, parseUpdatingData } from "@database/index";
import { countObj } from "@database/baseObjects";
import { DatabasePool } from "slonik/dist/src/types";
import { DatabaseTransactionConnection, sql } from "slonik";
import { z } from "zod";
import { diaryObj, createDiaryObj, updateDiaryObj } from "@database/diaryObjects";

export type Diary = z.output<typeof diaryObj>;

export type DiaryConnector = {
	create: (input: z.input<typeof createDiaryObj>) => Promise<Diary>;
	update: (input: z.input<typeof updateDiaryObj>) => Promise<Diary | undefined>;
	getByCategorizedTopic: (categoryName: string | null, topic: string) => Promise<Array<Diary>>;
	deleteObjs: (ids: Array<number>) => Promise<number>;
};

export const createDiaryConnector = async (
	dbPool?: DatabasePool | DatabaseTransactionConnection
): Promise<DiaryConnector> => {
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
			)`SELECT * FROM ${DIARY_TABLE} d INNER JOIN ${CATEGORY_TABLE} c ON d.category_id = c.id WHERE d.topic = ${topic} AND c.name = ${categoryName};`
		);
		return raw.rows;
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
		// FIXME
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		getByCategorizedTopic,
		deleteObjs,
	};
};
