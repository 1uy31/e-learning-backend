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
	getByDiary: (diaryId: number) => Promise<Readonly<Array<Note>> | undefined>;
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

	const getByDiary = async (diaryId: number) => {
		const raw = await db.query(sql.type(noteObj)`SELECT * FROM ${NOTE_TABLE} WHERE diary_id = ${diaryId};`);
		return raw.rows;
	};

	const deleteObjs = async (ids: Array<number>) => await deleteDbObjs(db, NOTE_TABLE, ids);

	return {
		create,
		update,
		getByDiary,
		deleteObjs,
	};
};
