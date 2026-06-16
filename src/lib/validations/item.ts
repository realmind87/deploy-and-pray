import { z } from "zod";

export const createItemSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(10_000).default(""),
});

export const updateItemSchema = createItemSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" },
);

export const bulkCreateItemsSchema = z.object({
  items: z.array(createItemSchema).min(1).max(500),
});

export const itemIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type BulkCreateItemsInput = z.infer<typeof bulkCreateItemsSchema>;
