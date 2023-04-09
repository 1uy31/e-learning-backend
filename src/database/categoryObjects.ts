import { baseObj } from "@database/baseObjects";
import { z } from "zod";

export const categoryObj = baseObj
	.extend({
		name: z.string(),
	})
	.transform((data) => ({
		id: data.id,
		createdAt: new Date(data.created_at),
		updatedAt: data.updated_at ? new Date(data.updated_at) : null,
		name: data.name,
	}));

export const inputCategoryBaseObj = z.object({
	name: z.string().max(256),
});

export const createCategoryObj = inputCategoryBaseObj.extend({});
export const updateCategoryObj = inputCategoryBaseObj.extend({
	id: z.number().gte(1),
});
