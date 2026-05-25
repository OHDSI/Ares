import { getAdapter } from "./adapters/registry.js";
import type { IncidenceOptions, IncidenceRateResult } from "#types/index.js";

export async function getIncidenceRates(
  options: IncidenceOptions,
): Promise<IncidenceRateResult[]> {
  return (await getAdapter(options.schema)).getIncidenceRates(options);
}
