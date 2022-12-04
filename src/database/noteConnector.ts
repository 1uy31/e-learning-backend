import { getDbPool, NOTE_TABLE, parseInsertingData } from "@database/index";
import { DatabasePool } from "slonik/dist/src/types";
import { DatabaseTransactionConnection, sql } from "slonik";
import { z } from "zod";
import { createNoteObj, noteObj } from "@database/noteObjects";

export type Note = z.output<typeof noteObj>;

export type NoteConnector = {
	create: (input: z.input<typeof createNoteObj>) => Promise<Note>;
};

export const createNoteConnector = async (
	dbPool?: DatabasePool | DatabaseTransactionConnection
): Promise<NoteConnector> => {
	const db = dbPool || (await getDbPool());
	const create = async (input: z.input<typeof createNoteObj>) => {
		const { columns, values } = parseInsertingData(createNoteObj, input);

		const raw = await db.query(
			sql.type(noteObj)`INSERT INTO ${NOTE_TABLE} (${columns}) VALUES (${values}) RETURNING *;`
		);
		return raw.rows[0];
	};

	return {
		create,
	};
};
