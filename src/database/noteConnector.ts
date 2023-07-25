import {
	deleteDbObjs,
	getDbPool,
	NOTE_TABLE,
	parseInsertingData,
	parseUpdatingData,
	SqlConnection,
} from "@database/index";
import { sql } from "slonik";
import { z } from "zod";
import { createNoteObj, noteObj, updateNoteObj } from "@database/noteObjects";

export type Note = z.output<typeof noteObj>;

export type NoteConnector = {
	create: (input: z.input<typeof createNoteObj>) => Promise<Note>;
	update: (input: z.input<typeof updateNoteObj>) => Promise<Note | undefined>;
	getMatchedObjects: (
		diaryId?: number,
		diaryIds?: Array<number>,
		limit?: number,
		offset?: number
	) => Promise<{ total: number; notes: Readonly<Array<Note>> }>;
	deleteObjs: (ids: Array<number>) => Promise<number>;
};

export const createNoteConnector = async (dbPool?: SqlConnection): Promise<NoteConnector> => {
	const db = dbPool || (await getDbPool());
	const create = async (input: z.input<typeof createNoteObj>) => {
		const { columns, values } = parseInsertingData(createNoteObj, input);

		const raw = await db.query(
			sql.type(noteObj)`INSERT INTO ${NOTE_TABLE} (${columns}) VALUES (${values}) RETURNING *;`
		);
		return raw.rows[0];
	};

	const update = async (input: z.input<typeof updateNoteObj>) => {
		const { id, dataSetter } = parseUpdatingData(updateNoteObj, input);

		const raw = await db.query(
			sql.type(noteObj)`UPDATE ${NOTE_TABLE} SET ${dataSetter} WHERE id = ${id} RETURNING *;`
		);
		return raw.rows[0];
	};

	const getMatchedObjects = async (diaryId?: number, diaryIds: Array<number> = [], limit = 10, offset = 0) => {
		if (diaryId) {
			diaryIds.push(diaryId);
		}
		const diaryCondition =
			diaryIds.length > 0
				? /** int4 must be in lowercase. **/
				  sql.fragment`diary_id = ANY(${sql.array(diaryIds, "int4")})`
				: diaryId === null
				? sql.fragment`diary_id IS NULL`
				: sql.fragment`TRUE`;

		const countQueryResult = await db.query(
			sql.type(
				z.object({ count: z.number().gte(0) })
			)`SELECT COUNT(*) FROM ${NOTE_TABLE} WHERE ${diaryCondition};`
		);
		const notesQueryResult = await db.query(
			sql.type(noteObj)`SELECT * FROM ${NOTE_TABLE} WHERE ${diaryCondition} 
                            GROUP BY id ORDER BY note_position ASC LIMIT ${limit} OFFSET ${offset};`
		);

		return { total: countQueryResult.rows[0].count, notes: notesQueryResult.rows };
	};

	const deleteObjs = async (ids: Array<number>) => await deleteDbObjs(db, NOTE_TABLE, ids);

	return {
		create,
		update,
		getMatchedObjects,
		deleteObjs,
	};
};
