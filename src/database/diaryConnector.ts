import { dbPool } from '@database/pool';
import { baseObject } from '@database/base';
import { DatabasePool } from 'slonik/dist/src/types';
import { sql } from 'slonik';
import { z } from 'zod';

const diaryObject = baseObject
	.extend({
		topic: z.string(),
		source_url: z.string().nullable(),
		review_count: z.number(),
		rate: z.number().nullable(),
		category_id: z.number().nullable(),
	})
	.transform((data) => ({
		id: data.id,
		createdAt: new Date(data.created_at),
		updatedAt: data.updated_at ? new Date(data.updated_at) : null,
		topic: data.topic,
		sourceUrl: data.source_url,
		reviewCount: data.review_count,
		rate: data.rate,
		categoryId: data.category_id,
	}));

export type Diary = z.output<typeof diaryObject>;

type DiaryCreateParams = {
	topic: string;
	sourceUrl?: string;
	categoryId?: number;
};

export type DiaryConnector = {
	create: (input: DiaryCreateParams) => Promise<Diary>;
};

export const createDiaryConnector = (db: DatabasePool = dbPool): DiaryConnector => {
	const create = async (input: DiaryCreateParams) => {
		const { topic, sourceUrl, categoryId } = input;
		const raw = await db.query(
			sql.type(diaryObject)`INSERT INTO diary (topic, source_url, category_id) VALUES (${topic}, ${
				sourceUrl || null
			}, ${categoryId || null} RETURNING *;`
		);
		return raw.rows[0];
	};

	return {
		create,
	};
};
