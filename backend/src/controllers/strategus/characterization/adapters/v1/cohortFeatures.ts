import { queryDb } from "#config/db.js";
import { parseCovariateNameString } from "../parseCovariateNameString.js";
import { buildCommonFilterClauses } from "../shared/filterClauses.js";
import type {
  CharacterizationCohortOptions,
  CharacterizationCohortBinaryResult,
  CharacterizationCohortContinuousResult,
  BinaryCovariate,
  CovariateRef,
  ContinuousCovariate,
} from "#types/index.js";
import type { NamedParams } from "#types/index.js";

async function getCharacterizationCohortCounts({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  databaseIds = null,
}: CharacterizationCohortOptions): Promise<Record<string, unknown>[]> {
  const params: NamedParams = {};
  const { targetClause, databaseClause: dbClause } = buildCommonFilterClauses(
    { targetIds, databaseIds },
    { target: "cc.target_cohort_id", database: "cc.database_id" },
    params,
  );

  const sql = `
    SELECT
      cc.database_id,
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      cc.target_cohort_id AS cohort_id,
      cg.cohort_name,
      cc.min_prior_observation,
      max(cc.person_count) AS n
    FROM ${schema}.${cTablePrefix}cohort_counts cc
    INNER JOIN ${schema}.${databaseTable} d
      ON cc.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
      ON cg.cohort_definition_id = cc.target_cohort_id
    WHERE cc.cohort_type = 'Target'
      ${targetClause}
      ${dbClause}
    GROUP BY
      cc.database_id, d.CDM_SOURCE_ABBREVIATION,
      cc.target_cohort_id, cg.cohort_name, cc.min_prior_observation
  `;

  return queryDb(sql, params);
}

export async function getCharacterizationCohortBinary(
  options: CharacterizationCohortOptions,
): Promise<CharacterizationCohortBinaryResult> {
  const {
    schema,
    cTablePrefix = "c_",
    cgTablePrefix = "cg_",
    databaseTable = "database_meta_data",
    targetIds = null,
    databaseIds = null,
    minThreshold = 0,
  } = options;

  let counts = await getCharacterizationCohortCounts({
    schema,
    cTablePrefix,
    cgTablePrefix,
    databaseTable,
    targetIds,
    databaseIds,
  });

  if (targetIds !== null && targetIds !== undefined) {
    const unique = [...new Set(targetIds)];
    const orderMap = Object.fromEntries(unique.map((id, i) => [id, i]));
    counts = counts
      .filter((r) => (r["cohortId"] as number) in orderMap)
      .sort(
        (a, b) =>
          (orderMap[a["cohortId"] as number] ?? 0) -
          (orderMap[b["cohortId"] as number] ?? 0),
      );
  }

  const colRef: Array<Record<string, unknown> & { id: number }> = counts.map(
    (r, i) => ({ ...r, id: i + 1 }),
  );
  if (colRef.length === 0) return { covariates: [], covRef: [] };

  const params: NamedParams = { minThreshold };
  const { targetClause, databaseClause: dbClause } = buildCommonFilterClauses(
    { targetIds, databaseIds },
    { target: "cov.target_cohort_id", database: "cov.database_id" },
    params,
  );

  const sql = `
    SELECT
      ref.covariate_name,
      ref.covariate_id,
      s.min_prior_observation,
      cov.target_cohort_id AS cohort_id,
      cov.database_id,
      cov.sum_value,
      cov.average_value
    FROM ${schema}.${cTablePrefix}covariates cov
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref ref
      ON cov.covariate_id = ref.covariate_id
      AND cov.setting_id = ref.setting_id
      AND cov.database_id = ref.database_id
    INNER JOIN ${schema}.${cTablePrefix}settings s
      ON s.database_id = cov.database_id
      AND s.setting_id = cov.setting_id
    WHERE cov.cohort_type = 'Target'
      ${targetClause}
      ${dbClause}
      AND abs(cov.average_value) >= @minThreshold
  `;

  const rows = await queryDb(sql, params);

  const colRefKey = (r: Record<string, unknown>) =>
    `${r["cohortId"]}|${r["databaseId"]}|${r["minPriorObservation"]}`;
  const colRefMap = new Map(colRef.map((r) => [colRefKey(r), r]));

  const merged = rows
    .map((r) => {
      const ref = colRefMap.get(colRefKey(r));
      return ref ? { ...r, id: ref["id"], n: ref["n"] } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null) as Record<
    string,
    unknown
  >[];

  const pivotKey = (r: Record<string, unknown>) =>
    `${r["covariateId"]}|${r["covariateName"]}`;
  const pivotMap = new Map<string, Record<string, unknown>>();

  for (const r of merged) {
    const key = pivotKey(r);
    if (!pivotMap.has(key)) {
      pivotMap.set(key, {
        covariateName: r["covariateName"],
        covariateNameParsed: parseCovariateNameString(
          r["covariateName"] as string,
        ),
        covariateId: r["covariateId"],
      });
    }
    const row = pivotMap.get(key)!;
    const avg = r["averageValue"] as number;
    const sum = r["sumValue"] as number;
    row[`sumValue_${r["id"]}`] = avg < 0 ? -Math.abs(sum) : sum;
    row[`averageValue_${r["id"]}`] = avg;
    row[`n_${r["id"]}`] = r["n"];
  }

  const res = [...pivotMap.values()];

  for (const row of res) {
    for (const ref of colRef) {
      const avgKey = `averageValue_${ref["id"]}`;
      const sumKey = `sumValue_${ref["id"]}`;
      const nKey = `n_${ref["id"]}`;
      if (row[avgKey] === null || row[avgKey] === undefined)
        row[avgKey] = -1 * minThreshold;
      if (row[sumKey] === null || row[sumKey] === undefined)
        row[sumKey] = -1 * Math.floor(minThreshold * (ref["n"] as number));
      if (row[nKey] === null || row[nKey] === undefined) row[nKey] = ref["n"];
    }
  }

  const sumCols = Object.keys(res[0] ?? {}).filter((k) =>
    k.startsWith("sumValue_"),
  );
  if (colRef.length === 2 && sumCols.length === 2) {
    for (const row of res) {
      const av1 = row["averageValue_1"] as number;
      const sv1 = row["sumValue_1"] as number;
      const n1 = row["n_1"] as number;
      const av2 = row["averageValue_2"] as number;
      const sv2 = row["sumValue_2"] as number;
      const n2 = row["n_2"] as number;
      const sd1 =
        ((Math.abs(av1) - 1) ** 2 * Math.abs(sv1) +
          (Math.abs(av1) - 0) ** 2 * (n1 - Math.abs(sv1))) /
        n1;
      const sd2 =
        ((Math.abs(av2) - 1) ** 2 * Math.abs(sv2) +
          (Math.abs(av2) - 0) ** 2 * (n2 - Math.abs(sv2))) /
        n2;
      const denom = Math.sqrt((sd1 ** 2 + sd2 ** 2) / 2);
      row["SMD"] = denom === 0 ? 0 : (av1 - av2) / denom;
      row["absSMD"] = Math.abs(row["SMD"] as number);
    }
  }

  for (const row of res) {
    for (const key of Object.keys(row)) {
      if (key.startsWith("n_")) delete row[key];
    }
  }

  return {
    covariates: res as unknown as BinaryCovariate[],
    covRef: colRef as unknown as CovariateRef[],
  };
}

export async function getCharacterizationCohortContinuous(
  options: CharacterizationCohortOptions,
): Promise<CharacterizationCohortContinuousResult> {
  const {
    schema,
    cTablePrefix = "c_",
    cgTablePrefix = "cg_",
    databaseTable = "database_meta_data",
    targetIds = null,
    databaseIds = null,
    minThreshold = 0,
  } = options;

  let counts = await getCharacterizationCohortCounts({
    schema,
    cTablePrefix,
    cgTablePrefix,
    databaseTable,
    targetIds,
    databaseIds,
  });

  if (targetIds !== null && targetIds !== undefined) {
    const unique = [...new Set(targetIds)];
    const orderMap = Object.fromEntries(unique.map((id, i) => [id, i]));
    counts = counts
      .filter((r) => (r["cohortId"] as number) in orderMap)
      .sort(
        (a, b) =>
          (orderMap[a["cohortId"] as number] ?? 0) -
          (orderMap[b["cohortId"] as number] ?? 0),
      );
  }

  const colRef: Array<
    Record<string, unknown> & { id: number; minCount: number }
  > = counts.map((r, i) => ({
    ...r,
    id: i + 1,
    minCount: (r["n"] as number) * minThreshold,
  }));
  if (colRef.length === 0) return { covariates: [], covRef: [] };

  const params: NamedParams = {};
  const { targetClause, databaseClause: dbClause } = buildCommonFilterClauses(
    { targetIds, databaseIds },
    { target: "cov.target_cohort_id", database: "cov.database_id" },
    params,
  );

  const sql = `
    SELECT
      cov.target_cohort_id AS cohort_id,
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      ref.covariate_name,
      s.min_prior_observation,
      cov.covariate_id,
      cov.database_id,
      cov.setting_id,
      cov.count_value,
      cov.average_value,
      cov.standard_deviation,
      cov.median_value,
      cov.min_value,
      cov.max_value,
      cov.p_10_value,
      cov.p_25_value,
      cov.p_75_value,
      cov.p_90_value
    FROM ${schema}.${cTablePrefix}covariates_continuous cov
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref ref
      ON cov.covariate_id = ref.covariate_id
      AND cov.setting_id = ref.setting_id
      AND cov.database_id = ref.database_id
    INNER JOIN ${schema}.${cTablePrefix}settings s
      ON cov.setting_id = s.setting_id
      AND cov.database_id = s.database_id
    INNER JOIN ${schema}.${databaseTable} d
      ON s.database_id = d.database_id
    WHERE cov.cohort_type = 'Target'
      ${targetClause}
      ${dbClause}
  `;

  const rows = await queryDb(sql, params);

  const colRefKey = (r: Record<string, unknown>) =>
    `${r["cohortId"]}|${r["databaseId"]}|${r["minPriorObservation"]}`;
  const colRefMap = new Map(colRef.map((r) => [colRefKey(r), r]));

  const merged = (
    rows
      .map((r) => {
        const ref = colRefMap.get(colRefKey(r));
        return ref ? { ...r, id: ref["id"], minCount: ref["minCount"] } : null;
      })
      .filter((r) => r !== null) as Record<string, unknown>[]
  ).filter((r) => (r["countValue"] as number) >= (r["minCount"] as number));

  const valueFields = [
    "countValue",
    "averageValue",
    "standardDeviation",
    "medianValue",
    "minValue",
    "maxValue",
    "p10Value",
    "p25Value",
    "p75Value",
    "p90Value",
  ];
  const pivotKey = (r: Record<string, unknown>) =>
    `${r["covariateId"]}|${r["covariateName"]}|${r["minPriorObservation"]}`;
  const pivotMap = new Map<string, Record<string, unknown>>();

  for (const r of merged) {
    const key = pivotKey(r);
    if (!pivotMap.has(key)) {
      pivotMap.set(key, {
        covariateName: r["covariateName"],
        covariateNameParsed: parseCovariateNameString(
          r["covariateName"] as string,
        ),
        covariateId: r["covariateId"],
        minPriorObservation: r["minPriorObservation"],
      });
    }
    const row = pivotMap.get(key)!;
    for (const field of valueFields) {
      row[`${field}_${r["id"]}`] = r[field] ?? 0;
    }
  }

  const res = [...pivotMap.values()];

  for (const row of res) {
    for (const ref of colRef) {
      for (const field of valueFields) {
        const k = `${field}_${ref["id"]}`;
        if (row[k] === null || row[k] === undefined) row[k] = 0;
      }
    }
  }

  const countCols = Object.keys(res[0] ?? {}).filter((k) =>
    k.startsWith("countValue_"),
  );
  if (colRef.length === 2 && countCols.length === 2) {
    for (const row of res) {
      const sd1 = row["standardDeviation_1"] as number;
      const sd2 = row["standardDeviation_2"] as number;
      const av1 = row["averageValue_1"] as number;
      const av2 = row["averageValue_2"] as number;
      const denom = Math.sqrt((Math.abs(sd1) ** 2 + Math.abs(sd2) ** 2) / 2);
      row["SMD"] = denom === 0 ? 0 : (Math.abs(av1) - Math.abs(av2)) / denom;
      row["absSMD"] = Math.abs(row["SMD"] as number);
    }
  }

  return {
    covariates: res as unknown as ContinuousCovariate[],
    covRef: colRef as unknown as CovariateRef[],
  };
}
