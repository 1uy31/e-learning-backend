import { DIARY_TABLE, CATEGORY_TABLE, getDbPool } from "@database/index";
import { countObj } from "@database/baseObjects";
import { DatabasePool } from "slonik/dist/src/types";
import { sql } from "slonik";
import { z } from "zod";
import { diaryObj, createDiaryObj, updateDiaryObj } from "@database/diaryObjects";
import { isDefined } from "@src/utils";

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
		const parsedInput = createDiaryObj.parse(input);
		const keysToInsert = Object.entries(parsedInput)
			.filter((item) => isDefined(item[1]))
			.map((item) => item[0]);

		const valuesToInsert = Object.values(parsedInput).filter(isDefined);

		const identifiers = keysToInsert.map((key) => sql.identifier([key]));
		const columns = sql.join(identifiers, sql.fragment`, `);
		const values = sql.join(valuesToInsert, sql.fragment`, `);

		const raw = await db.query(
			sql.type(diaryObj)`INSERT INTO ${DIARY_TABLE} (${columns}) VALUES (${values}) RETURNING *;`
		);
		return diaryObj.parse(raw.rows[0]);
	};

	const update = async (input: z.infer<typeof updateDiaryObj>) => {
		const parsedInput = updateDiaryObj.parse(input);
		const { id, ...restOfInput } = parsedInput;
		const keysToUpdate = Object.entries(restOfInput)
			.filter((item) => isDefined(item[1]))
			.map((item) => item[0]);

		const valuesToUpdate = Object.values(restOfInput).filter(isDefined);

		const setData = sql.join(
			keysToUpdate.map((column, idx) => {
				return sql.fragment`${sql.identifier([column])} = ${valuesToUpdate[idx]}`;
			}),
			sql.fragment`,`
		);

		const raw = await db.query(
			sql.type(diaryObj)`UPDATE ${DIARY_TABLE} SET ${setData} WHERE id = ${id} RETURNING *;`
		);
		return raw.rows[0] ? diaryObj.parse(raw.rows[0]) : undefined;
	};

	const getByCategorizedTopic = async (categoryName: string | null, topic: string) => {
		let query = `SELECT * FROM ${DIARY_TABLE} WHERE topic = ${topic} AND category_id IS NULL;`;
		if (categoryName !== null) {
			query = `SELECT * FROM ${DIARY_TABLE} d INNER JOIN ${CATEGORY_TABLE} c LIMIT 1 WHERE d.topic = ${topic} AND c.name = ${categoryName};`;
		}
		const raw = await db.query(sql.type(diaryObj)`${query}`);
		return raw.rows[0] ? diaryObj.parse(raw.rows[0]) : undefined;
	};

	const deleteObjs = async (ids: Array<number>) => {
		const uniqueIds = [...new Set(ids)];
		const count = await db.transaction(async (connection) => {
			const raw = await connection.query(
				sql.type(countObj)`DELETE FROM ${DIARY_TABLE} WHERE id IN ${uniqueIds};`
			);
			return raw.rows[0].count;
		});
		return count;
	};

	return {
		create,
		update,
		getByCategorizedTopic,
		deleteObjs,
	};
};
