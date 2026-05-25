import { getAdapter } from "./adapters/registry.js";
import type {
  DechallengeOptions,
  DechallengeFailOptions,
  DeChallengeRechallengeResult,
  DeChallengeFailRow,
} from "#types/index.js";

export async function getDechallengeRechallenge(
  options: DechallengeOptions,
): Promise<DeChallengeRechallengeResult[]> {
  return (await getAdapter(options.schema)).getDechallengeRechallenge(options);
}

export async function getDechallengeRechallengeFails(
  options: DechallengeFailOptions,
): Promise<DeChallengeFailRow[]> {
  return (await getAdapter(options.schema)).getDechallengeRechallengeFails(
    options,
  );
}
