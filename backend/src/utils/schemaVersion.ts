import { queryDb } from "../config/db.js";

// Add new versions here (newest first). The fallback is always "v1".
const VERSION_CHECKS = [
  { version: "v2" as const, table: "c_risk_factor_covariates" },
] as const;

export type SchemaVersion = (typeof VERSION_CHECKS)[number]["version"] | "v1";

const TTL_MS = 5 * 60 * 1000;

const cache = new Map<string, { version: SchemaVersion; expiresAt: number }>();

export async function detectSchemaVersion(
  schema: string,
): Promise<SchemaVersion> {
  const entry = cache.get(schema);
  if (entry && Date.now() < entry.expiresAt) return entry.version;

  for (const { version, table } of VERSION_CHECKS) {
    const rows = await queryDb(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = @schema AND table_name = @table LIMIT 1`,
      { schema, table },
    );
    if (rows.length > 0) {
      cache.set(schema, { version, expiresAt: Date.now() + TTL_MS });
      return version;
    }
  }

  cache.set(schema, { version: "v1", expiresAt: Date.now() + TTL_MS });
  return "v1";
}
