import { z } from "zod";

export const paginationQuerySchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export type PaginatedResult<T> = {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
};

export function buildCursorResult<T extends { id: number }>(
  rows: T[],
  limit: number,
): PaginatedResult<T> {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? data[data.length - 1]?.id ?? null : null;

  return { data, nextCursor, hasMore };
}

export const offsetPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type OffsetPagination = z.infer<typeof offsetPaginationSchema>;

export function getOffset({ page, pageSize }: OffsetPagination) {
  return (page - 1) * pageSize;
}
