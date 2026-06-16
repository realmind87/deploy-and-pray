import "server-only";

import { eq, gt, inArray, sql } from "drizzle-orm";
import { db, withTransaction } from "@/db";
import { type Item, items } from "@/db/schema";
import { cacheDel, cacheGet, cacheKey, cacheSet } from "@/lib/cache";
import { buildCursorResult, type PaginatedResult, type PaginationQuery } from "@/lib/pagination";
import type { CreateItemInput, UpdateItemInput } from "@/lib/validations/item";

const LIST_CACHE_NS = "items:list";

export class ItemsRepository {
  async findByCursor({ cursor, limit }: PaginationQuery): Promise<PaginatedResult<Item>> {
    const cacheId = cacheKey(LIST_CACHE_NS, cursor ?? "start", limit);
    const cached = await cacheGet<PaginatedResult<Item>>(cacheId);
    if (cached) return cached;

    const rows = await db
      .select()
      .from(items)
      .where(cursor ? gt(items.id, cursor) : undefined)
      .orderBy(items.id)
      .limit(limit + 1);

    const result = buildCursorResult(rows, limit);
    await cacheSet(cacheId, result, 60);
    return result;
  }

  async findById(id: number): Promise<Item | undefined> {
    const cacheId = cacheKey("items:detail", id);
    const cached = await cacheGet<Item>(cacheId);
    if (cached) return cached;

    const [row] = await db.select().from(items).where(eq(items.id, id)).limit(1);
    if (row) await cacheSet(cacheId, row, 120);
    return row;
  }

  async create(input: CreateItemInput): Promise<Item> {
    const [row] = await db
      .insert(items)
      .values({
        title: input.title,
        content: input.content,
      })
      .returning();

    await this.invalidateListCache();
    return row;
  }

  async createMany(inputs: CreateItemInput[]): Promise<Item[]> {
    if (inputs.length === 0) return [];

    const rows = await withTransaction(async (tx) => {
      return tx
        .insert(items)
        .values(
          inputs.map((input) => ({
            title: input.title,
            content: input.content,
          })),
        )
        .returning();
    });

    await this.invalidateListCache();
    return rows;
  }

  async update(id: number, input: UpdateItemInput): Promise<Item | undefined> {
    const [row] = await db
      .update(items)
      .set({
        ...input,
        updatedAt: sql`now()`,
      })
      .where(eq(items.id, id))
      .returning();

    if (row) {
      await cacheDel(cacheKey("items:detail", id));
      await this.invalidateListCache();
    }

    return row;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db.delete(items).where(eq(items.id, id)).returning({ id: items.id });
    if (deleted.length > 0) {
      await cacheDel(cacheKey("items:detail", id));
      await this.invalidateListCache();
    }
    return deleted.length > 0;
  }

  async deleteMany(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;

    const deleted = await withTransaction(async (tx) => {
      return tx.delete(items).where(inArray(items.id, ids)).returning({ id: items.id });
    });

    await cacheDel(...ids.map((id) => cacheKey("items:detail", id)));
    await this.invalidateListCache();
    return deleted.length;
  }

  async count(): Promise<number> {
    const cacheId = cacheKey("items:count");
    const cached = await cacheGet<number>(cacheId);
    if (cached !== null) return cached;

    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(items);
    const count = row?.count ?? 0;
    await cacheSet(cacheId, count, 30);
    return count;
  }

  private async invalidateListCache(): Promise<void> {
    await cacheDel(cacheKey("items:count"));
    // List cache keys use cursor/limit pattern; short TTL handles the rest.
  }
}

export const itemsRepository = new ItemsRepository();
