import { getDbPool, NOTE_TABLE } from '@database/index';
import { DatabasePool } from 'slonik/dist/src/types';
import { sql } from 'slonik';
import { z } from 'zod';
import { createNoteObj, noteObj } from '@database/noteObjects';
import { isDefined } from '@src/utils';

export type Note = z.output<typeof noteObj>;

export type NoteConnector = {
	create: (input: z.infer<typeof createNoteObj>) => Promise<Note>;
};

export const createNoteConnector = async (dbPool?: DatabasePool): Promise<NoteConnector> => {
	const db = dbPool || (await getDbPool());
	const create = async (input: z.infer<typeof createNoteObj>) => {
		const parsedInput = createNoteObj.parse(input);
		const keysToInsert = Object.entries(parsedInput)
			.filter((item) => isDefined(item[1]))
			.map((item) => item[0]);

		const valuesToInsert = Object.values(parsedInput).filter(isDefined);

		const identifiers = keysToInsert.map((key) => sql.identifier([key]));
		const columns = sql.join(identifiers, sql.fragment`, `);
		const values = sql.join(valuesToInsert, sql.fragment`, `);

		const raw = await db.query(
			sql.type(noteObj)`INSERT INTO ${NOTE_TABLE} (${columns}) VALUES (${values}) RETURNING *;`
		);
		return noteObj.parse(raw.rows[0]);
	};

	return {
		create,
	};
};
