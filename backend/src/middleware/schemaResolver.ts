import type { Request, Response, NextFunction } from "express";
import { getValidSchemaNames } from "../controllers/strategus/dbList.js";
import logger from "../utils/logger.js";

const DB_LIST_SCHEMA = process.env["DB_LIST_SCHEMA"] ?? null;
const DEFAULT_SCHEMA = process.env["STRATEGUS_SCHEMA"] ?? "app";
const SAFE_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const TTL_MS = 5 * 60 * 1000;

let _validSchemas: Set<string> | null = null;
let _expiresAt = 0;

async function getValidSchemas(): Promise<Set<string>> {
  if (_validSchemas !== null && Date.now() < _expiresAt) return _validSchemas;
  if (!DB_LIST_SCHEMA) {
    _validSchemas = new Set();
    _expiresAt = Infinity;
    return _validSchemas;
  }
  try {
    const names = await getValidSchemaNames({ listSchema: DB_LIST_SCHEMA });
    _validSchemas = new Set(names);
    _expiresAt = Date.now() + TTL_MS;
  } catch (e) {
    logger.error(
      `db-list schema load failed: ${e instanceof Error ? e.message : String(e)}`,
    );
    _validSchemas = new Set();
    _expiresAt = Date.now() + TTL_MS;
  }
  return _validSchemas;
}

export default async function schemaResolver(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const requested = req.query["schema"] as string | undefined;
  if (!requested || !SAFE_IDENTIFIER.test(requested)) {
    req.resolvedSchema = DEFAULT_SCHEMA;
    return next();
  }
  const valid = await getValidSchemas();
  req.resolvedSchema = valid.has(requested) ? requested : DEFAULT_SCHEMA;
  next();
}
