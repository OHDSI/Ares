import { detectSchemaVersion } from "#utils/schemaVersion.js";
import type { Adapter, SchemaVersion } from "#types/index.js";
import * as v1 from "./v1/index.js";
import * as v2 from "./v2/index.js";

const ADAPTERS: Record<SchemaVersion, Adapter> = { v1, v2 };

export async function getAdapter(schema: string): Promise<Adapter> {
  const version = await detectSchemaVersion(schema);
  return ADAPTERS[version] ?? ADAPTERS["v1"]!;
}
