import { queryDb } from "#config/db.js";
import type { DbListEntry } from "#types/index.js";

export async function getDbList({
  listSchema,
}: {
  listSchema: string;
}): Promise<DbListEntry[]> {
  const sql = `SELECT db_name, schema_name, release_date FROM ${listSchema}.db_list ORDER BY release_date DESC`;
  return queryDb(sql) as unknown as Promise<DbListEntry[]>;
}

export async function getValidSchemaNames({
  listSchema,
}: {
  listSchema: string;
}): Promise<string[]> {
  const sql = `SELECT schema_name FROM ${listSchema}.db_list`;
  const rows = await queryDb(sql);
  return rows.map((r) => r["schemaName"] as string);
}
