"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Item } from "@/db/schema";
import type { PaginatedResult } from "@/lib/pagination";

const ITEMS_KEY = ["items"] as const;

async function fetchItems(cursor?: number, limit = 20): Promise<PaginatedResult<Item>> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", String(cursor));
  const res = await fetch(`/api/items?${params}`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export function useItems(cursor?: number, limit = 20) {
  return useQuery({
    queryKey: [...ITEMS_KEY, { cursor, limit }],
    queryFn: () => fetchItems(cursor, limit),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { title: string; content?: string }) => {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create item");
      return res.json() as Promise<Item>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}
