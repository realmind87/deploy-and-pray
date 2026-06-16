"use server";

import { revalidatePath } from "next/cache";
import { itemsRepository } from "@/repositories/items.repository";
import {
  bulkCreateItemsSchema,
  createItemSchema,
  itemIdSchema,
  updateItemSchema,
} from "@/lib/validations/item";
import { paginationQuerySchema } from "@/lib/pagination";

export async function getItemsAction(input: unknown) {
  const query = paginationQuerySchema.parse(input);
  return itemsRepository.findByCursor(query);
}

export async function getItemAction(input: unknown) {
  const { id } = itemIdSchema.parse(input);
  const item = await itemsRepository.findById(id);
  if (!item) throw new Error("Item not found");
  return item;
}

export async function createItemAction(input: unknown) {
  const data = createItemSchema.parse(input);
  const item = await itemsRepository.create(data);
  revalidatePath("/items");
  return item;
}

export async function bulkCreateItemsAction(input: unknown) {
  const { items: rows } = bulkCreateItemsSchema.parse(input);
  const created = await itemsRepository.createMany(rows);
  revalidatePath("/items");
  return { count: created.length, items: created };
}

export async function updateItemAction(input: unknown) {
  if (typeof input !== "object" || input === null) {
    throw new Error("Invalid input");
  }
  const { id, ...rest } = input as Record<string, unknown>;
  const item = await itemsRepository.update(
    itemIdSchema.parse({ id }).id,
    updateItemSchema.parse(rest),
  );
  if (!item) throw new Error("Item not found");
  revalidatePath("/items");
  return item;
}

export async function deleteItemAction(input: unknown) {
  const { id } = itemIdSchema.parse(input);
  const deleted = await itemsRepository.delete(id);
  if (!deleted) throw new Error("Item not found");
  revalidatePath("/items");
  return { success: true };
}
