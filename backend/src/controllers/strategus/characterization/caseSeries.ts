import { getAdapter } from "./adapters/registry.js";
import type {
  CaseSeriesOptions,
  BinaryCaseSeriesResult,
} from "#types/index.js";

export async function getBinaryCaseSeries(
  options: CaseSeriesOptions,
): Promise<BinaryCaseSeriesResult[]> {
  return (await getAdapter(options.schema)).getBinaryCaseSeries(options);
}

export async function getContinuousCaseSeries(
  options: CaseSeriesOptions,
): Promise<Record<string, unknown>[]> {
  return (await getAdapter(options.schema)).getContinuousCaseSeries(options);
}
