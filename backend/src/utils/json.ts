import logger from "./logger.js";

export function safeParse(value: unknown): unknown {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    logger.warn(`Failed to parse JSON value: ${value}`);
    return null;
  }
}
