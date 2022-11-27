import { dbPool } from '@database/pool';
import { baseObject } from '@database/base';
import { DatabasePool } from 'slonik/dist/src/types';
import { sql } from 'slonik';
import { z } from 'zod';

const noteObject = baseObject
	.extend({
		content: z.string(),
		note_position: z.number(),
		image_url: z.string().nullable(),
		source_url: z.string().nullable(),
		diary_id: z.number().nullable(),
	})
	.transform((data) => ({
		id: data.id,
		createdAt: new Date(data.created_at),
		updatedAt: data.updated_at ? new Date(data.updated_at) : null,
		content: data.content,
		notePosition: data.note_position,
		imageUrl: data.image_url,
		sourceUrl: data.source_url,
		diaryId: data.diary_id,
	}));

export type Note = z.output<typeof noteObject>;

type NoteCreateParams = {
	content: string;
	notePosition: number;
	imageUrl?: string;
	sourceUrl?: string;
	diaryId?: number;
};

export type NoteConnector = {
	create: (input: NoteCreateParams) => Promise<Note>;
};

export const createNoteConnector = (db: DatabasePool = dbPool): NoteConnector => {
	const create = async (input: NoteCreateParams) => {
		const { content, notePosition, imageUrl, sourceUrl, diaryId } = input;
		const raw = await db.query(
			sql.type(
				noteObject
			)`INSERT INTO diary (content, note_position, image_url, source_url, diary_id) VALUES (${content}, ${notePosition}, ${
				imageUrl || null
			}, ${sourceUrl || null}, ${diaryId || null} RETURNING *;`
		);
		return raw.rows[0];
	};

	return {
		create,
	};
};
