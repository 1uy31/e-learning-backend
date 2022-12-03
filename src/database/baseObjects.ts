import { z } from "zod";

export const baseObj = z.object({
	id: z.number(),
	created_at: z.number(),
	updated_at: z.number().nullable(),
});

export const countObj = z.object({
	count: z.number(),
});
