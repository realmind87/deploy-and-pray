import { NextResponse } from "next/server";
import { itemsRepository } from "@/repositories/items.repository";
import { itemIdSchema, updateItemSchema } from "@/lib/validations/item";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = itemIdSchema.parse({ id: (await context.params).id });
    const item = await itemsRepository.findById(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = itemIdSchema.parse({ id: (await context.params).id });
    const body = await request.json();
    const data = updateItemSchema.parse(body);
    const item = await itemsRepository.update(id, data);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = itemIdSchema.parse({ id: (await context.params).id });
    const deleted = await itemsRepository.delete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}
