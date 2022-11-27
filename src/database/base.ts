import { z } from 'zod';

export const baseObject = z.object({
	id: z.number(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const countObject = z.object({
	count: z.number(),
});
