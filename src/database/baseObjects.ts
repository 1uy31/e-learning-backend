import { z } from 'zod';

export const baseObj = z.object({
	id: z.number(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const countObj = z.object({
	count: z.number(),
});
