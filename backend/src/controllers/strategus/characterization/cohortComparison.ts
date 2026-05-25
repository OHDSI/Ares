import { getAdapter } from "./adapters/registry.js";
import type {
  CharacterizationCohortOptions,
  CharacterizationCohortBinaryResult,
  CharacterizationCohortContinuousResult,
} from "#types/index.js";

export async function getCharacterizationCohortBinary(
  options: CharacterizationCohortOptions,
): Promise<CharacterizationCohortBinaryResult> {
  return (await getAdapter(options.schema)).getCharacterizationCohortBinary(
    options,
  );
}

export async function getCharacterizationCohortContinuous(
  options: CharacterizationCohortOptions,
): Promise<CharacterizationCohortContinuousResult> {
  return (await getAdapter(options.schema)).getCharacterizationCohortContinuous(
    options,
  );
}
