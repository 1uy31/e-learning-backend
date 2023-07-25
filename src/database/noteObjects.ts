import { baseObj, primitiveObj } from "@database/baseObjects";
import { z } from "zod";

export const noteObj = baseObj
	.extend({
		content: z.record(z.union([z.string(), z.number()]), primitiveObj),
		note_position: z.number(),
		source_url: z.string().nullable(),
		file_path: z.string().nullable(),
		diary_id: z.number().nullable(),
	})
	.transform((data) => ({
		id: data.id,
		createdAt: new Date(data.created_at),
		updatedAt: data.updated_at ? new Date(data.updated_at) : null,
		content: data.content,
		notePosition: data.note_position,
		sourceUrl: data.source_url,
		filePath: data.file_path,
		diaryId: data.diary_id,
	}));

export const inputNoteBaseObj = z.object({
	notePosition: z.number().gte(0),
	content: z.record(z.union([z.string(), z.number()]), primitiveObj),
	sourceUrl: z.string().max(256).nullable().optional(),
	filePath: z.string().max(256).nullable().optional(),
	diaryId: z.number().gte(0).nullable().optional(),
});

export const createNoteObj = inputNoteBaseObj.extend({}).transform((data) => {
	const { notePosition, sourceUrl, filePath, diaryId, ...restOfData } = data;
	return {
		...restOfData,
		note_position: notePosition,
		source_url: sourceUrl,
		file_path: filePath,
		diary_id: diaryId,
	};
});

export const updateNoteObj = inputNoteBaseObj
	.extend({ id: z.number().gte(1), notePosition: z.number().gte(0).optional() })
	.transform((data) => {
		const { notePosition, sourceUrl, filePath, diaryId, ...restOfData } = data;
		return {
			...restOfData,
			note_position: notePosition,
			source_url: sourceUrl,
			file_path: filePath,
			diary_id: diaryId,
		};
	});
