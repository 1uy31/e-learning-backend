import { z } from "zod";

export const baseObj = z.object({
	id: z.number(),
	created_at: z.number(),
	updated_at: z.number().nullable(),
});

export const countObj = z.object({
	count: z.number(),
});

export const primitiveObj = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export type PrimitiveType = z.infer<typeof primitiveObj>;
export type Json = PrimitiveType | { [key: string]: Json } | Json[];
export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([primitiveObj, z.array(jsonSchema), z.record(jsonSchema)])
);
