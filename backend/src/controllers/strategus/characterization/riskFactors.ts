import { getAdapter } from "./adapters/registry.js";
import type {
  CaseCountOptions,
  CaseTargetCountOptions,
  RiskFactorOptions,
  CaseCountResult,
  CaseTargetCountResult,
  BinaryRiskFactorResult,
  ContinuousRiskFactorResult,
} from "#types/index.js";

export async function getCaseCounts(
  options: CaseCountOptions,
): Promise<CaseCountResult[]> {
  return (await getAdapter(options.schema)).getCaseCounts(options);
}

export async function getCaseTargetCounts(
  options: CaseTargetCountOptions,
): Promise<CaseTargetCountResult[]> {
  return (await getAdapter(options.schema)).getCaseTargetCounts(options);
}

export async function getBinaryRiskFactors(
  options: RiskFactorOptions,
): Promise<BinaryRiskFactorResult[] | null> {
  return (await getAdapter(options.schema)).getBinaryRiskFactors(options);
}

export async function getContinuousRiskFactors(
  options: RiskFactorOptions,
): Promise<ContinuousRiskFactorResult[] | null> {
  return (await getAdapter(options.schema)).getContinuousRiskFactors(options);
}
