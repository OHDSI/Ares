import { getAdapter } from "./adapters/registry.js";
import type {
  OutcomeAvailabilityOptions,
  OutcomeAvailabilityResult,
} from "#types/index.js";

export async function getOutcomeDataAvailability(
  options: OutcomeAvailabilityOptions,
): Promise<OutcomeAvailabilityResult[]> {
  return (await getAdapter(options.schema)).getOutcomeDataAvailability(options);
}
