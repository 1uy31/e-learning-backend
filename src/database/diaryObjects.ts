import { baseObj } from "@database/baseObjects";
import { z } from "zod";

export const diaryObj = baseObj
	.extend({
		topic: z.string(),
		source_url: z.string().nullable(),
		review_count: z.number(),
		rate: z.number().nullable(),
		category_id: z.number().nullable(),
		parent_diary_id: z.number().nullable(),
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
		parentDiaryId: data.parent_diary_id,
	}));

export const inputDiaryBaseObj = z.object({
	topic: z.string().max(1024),
	sourceUrl: z.string().max(256).nullable().optional(),
	rate: z.number().nullable().optional(),
	categoryId: z.number().nullable().optional(),
	parentDiaryId: z.number().nullable().optional(),
});

export const createDiaryObj = inputDiaryBaseObj.extend({}).transform((data) => {
	const { sourceUrl, categoryId, parentDiaryId, ...restOfData } = data;
	return {
		...restOfData,
		source_url: sourceUrl,
		category_id: categoryId,
		parent_diary_id: parentDiaryId,
	};
});

export const updateDiaryObj = inputDiaryBaseObj
	.extend({
		id: z.number().gte(1),
		topic: z.string().max(1024).optional(),
		reviewCount: z.number().gte(0).optional(),
	})
	.transform((data) => {
		const { sourceUrl, categoryId, reviewCount, parentDiaryId, ...restOfData } = data;
		return {
			...restOfData,
			source_url: sourceUrl,
			category_id: categoryId,
			parent_diary_id: parentDiaryId,
			review_count: reviewCount,
		};
	});
