import { addOptionalClause, addFilterParam } from "#shared/queryHelpers.js";
import type { NamedParams } from "#types/index.js";

export function buildCommonFilterClauses(
  opts: {
    targetIds?: (string | number)[] | null;
    databaseIds?: (string | number)[] | null;
  },
  aliases: { target: string; database: string },
  params: NamedParams,
): { targetClause: string; databaseClause: string } {
  return {
    targetClause: addFilterParam(
      opts.targetIds,
      (ic) => `AND ${aliases.target} IN (${ic})`,
      "targetId",
      params,
    ),
    databaseClause: addFilterParam(
      opts.databaseIds,
      (ic) => `AND ${aliases.database} IN (${ic})`,
      "databaseId",
      params,
    ),
  };
}

export function buildRiskWindowClauses(
  opts: {
    riskWindowStart?: number | null;
    riskWindowEnd?: number | null;
    startAnchor?: string | null;
    endAnchor?: string | null;
  },
  tableAlias: string,
  params: NamedParams,
): {
  rwStartClause: string;
  rwEndClause: string;
  startAnchorClause: string;
  endAnchorClause: string;
} {
  const { riskWindowStart, riskWindowEnd, startAnchor, endAnchor } = opts;

  const rwStartClause = addOptionalClause(
    riskWindowStart !== null && riskWindowStart !== undefined,
    `AND ${tableAlias}.risk_window_start = @riskWindowStart`,
  );
  if (riskWindowStart !== null && riskWindowStart !== undefined)
    params["riskWindowStart"] = riskWindowStart;

  const rwEndClause = addOptionalClause(
    riskWindowEnd !== null && riskWindowEnd !== undefined,
    `AND ${tableAlias}.risk_window_end = @riskWindowEnd`,
  );
  if (riskWindowEnd !== null && riskWindowEnd !== undefined)
    params["riskWindowEnd"] = riskWindowEnd;

  const startAnchorClause = addOptionalClause(
    startAnchor !== null && startAnchor !== undefined,
    `AND ${tableAlias}.start_anchor = @startAnchor`,
  );
  if (startAnchor !== null && startAnchor !== undefined)
    params["startAnchor"] = startAnchor;

  const endAnchorClause = addOptionalClause(
    endAnchor !== null && endAnchor !== undefined,
    `AND ${tableAlias}.end_anchor = @endAnchor`,
  );
  if (endAnchor !== null && endAnchor !== undefined)
    params["endAnchor"] = endAnchor;

  return { rwStartClause, rwEndClause, startAnchorClause, endAnchorClause };
}
