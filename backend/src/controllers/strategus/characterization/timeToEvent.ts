import { getAdapter } from "./adapters/registry.js";
import type { TimeToEventOptions, TimeToEventResult } from "#types/index.js";

export async function getTimeToEvent(
  options: TimeToEventOptions,
): Promise<TimeToEventResult[]> {
  return (await getAdapter(options.schema)).getTimeToEvent(options);
}
