import { baseObj } from "@database/baseObjects";
import { z } from "zod";

export const noteObj = baseObj
	.extend({
		content: z.string().nullable(),
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

export const inputNoteBaseObj = z.object({
	content: z.string().nullable().optional(),
	notePosition: z.number().gte(0),
	imageUrl: z.string().max(256).nullable().optional(),
	sourceUrl: z.string().max(256).nullable().optional(),
	diaryId: z.number().gte(0).nullable().optional(),
});

export const createNoteObj = inputNoteBaseObj.extend({}).transform((data) => {
	const { notePosition, imageUrl, sourceUrl, diaryId, ...restOfData } = data;
	return {
		...restOfData,
		note_position: notePosition,
		image_url: imageUrl,
		source_url: sourceUrl,
		diary_id: diaryId,
	};
});

export const updateNoteObj = inputNoteBaseObj
	.extend({ id: z.number().gte(1), notePosition: z.number().gte(0).optional() })
	.transform((data) => {
		const { notePosition, imageUrl, sourceUrl, diaryId, ...restOfData } = data;
		return {
			...restOfData,
			note_position: notePosition,
			image_url: imageUrl,
			source_url: sourceUrl,
			diary_id: diaryId,
		};
	});
