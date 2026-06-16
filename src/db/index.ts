import "server-only";

import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { drizzle, type PostgresJsDatabase, type PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

function createSql() {
  const env = getEnv();
  return postgres(env.DATABASE_URL, {
    max: env.DB_POOL_MAX,
    idle_timeout: env.DB_IDLE_TIMEOUT,
    connect_timeout: env.DB_CONNECT_TIMEOUT,
    prepare: true,
  });
}

const sql = globalForDb.sql ?? createSql();

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export const db = drizzle(sql, { schema, logger: process.env.NODE_ENV === "development" });

export type DbClient = PostgresJsDatabase<typeof schema>;
export type DbTransaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export async function withTransaction<T>(fn: (tx: DbTransaction) => Promise<T>): Promise<T> {
  return db.transaction(fn);
}
