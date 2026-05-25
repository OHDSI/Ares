import { queryDb } from "#config/db.js";
import { parseCovariateNameString } from "../parseCovariateNameString.js";
import { buildCommonFilterClauses } from "../shared/filterClauses.js";
import type {
  CharacterizationCohortOptions,
  CharacterizationCohortBinaryResult,
  CharacterizationCohortContinuousResult,
  CovariateRef,
  BinaryCovariate,
  ContinuousCovariate,
} from "#types/index.js";
import type { NamedParams } from "#types/index.js";

type Row = Record<string, unknown>;

async function getCharacterizationTargetCohortCounts({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  databaseIds = null,
}: CharacterizationCohortOptions): Promise<Row[]> {
  const params: NamedParams = {};
  const { targetClause, databaseClause: dbClause } = buildCommonFilterClauses(
    { targetIds, databaseIds },
    { target: "ts.target_id", database: "ts.database_id" },
    params,
  );

  const sql = `
    SELECT DISTINCT
      ts.database_id,
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      ts.target_id AS cohort_id,
      cg.cohort_name,
      ts.min_prior_observation,
      attr.n
    FROM ${schema}.${cTablePrefix}target_settings ts
    INNER JOIN ${schema}.${databaseTable} d
      ON ts.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
      ON cg.cohort_definition_id = ts.target_id
    LEFT JOIN (
      SELECT cohort_definition_id, database_id, setting_id, MIN(n) AS n
      FROM ${schema}.${cTablePrefix}attrition
      GROUP BY cohort_definition_id, database_id, setting_id
    ) attr
      ON attr.cohort_definition_id = ts.target_id
      AND attr.database_id = ts.database_id
      AND attr.setting_id = ts.setting_id
    WHERE 1 = 1
      ${targetClause}
      ${dbClause}
  `;

  return queryDb(sql, params);
}

export async function getCharacterizationCohortBinary({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  databaseIds = null,
  minThreshold = 0,
}: CharacterizationCohortOptions): Promise<CharacterizationCohortBinaryResult> {
  let counts = await getCharacterizationTargetCohortCounts({
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

  const colRef: (Row & { id: number })[] = counts.map((r, i) => ({
    ...r,
    id: i + 1,
  }));
  if (colRef.length === 0) return { covariates: [], covRef: [] };

  const params: NamedParams = { minThreshold };
  const { targetClause, databaseClause: dbClause } = buildCommonFilterClauses(
    { targetIds, databaseIds },
    { target: "ts.target_id", database: "tc.database_id" },
    params,
  );

  const sql = `
    SELECT
      cr.covariate_name,
      cr.covariate_id,
      ts.min_prior_observation,
      ts.target_id AS cohort_id,
      tc.database_id,
      tc.sum_value,
      tc.average_value
    FROM ${schema}.${cTablePrefix}target_covariates tc
    INNER JOIN ${schema}.${cTablePrefix}target_settings ts
      ON tc.characterization_target_id = ts.characterization_target_id
      AND tc.database_id = ts.database_id
      AND tc.setting_id = ts.setting_id
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref cr
      ON tc.covariate_id = cr.covariate_id
      AND tc.database_id = cr.database_id
      AND tc.setting_id = cr.setting_id
    WHERE 1 = 1
      ${targetClause}
      ${dbClause}
      AND abs(tc.average_value) >= @minThreshold
  `;

  const rows = await queryDb(sql, params);

  const colRefKey = (r: Row) =>
    `${r["cohortId"]}|${r["databaseId"]}|${r["minPriorObservation"]}`;
  const colRefMap = new Map(colRef.map((r) => [colRefKey(r), r]));

  const merged = rows
    .map((r) => {
      const ref = colRefMap.get(colRefKey(r));
      return ref ? { ...r, id: ref.id } : null;
    })
    .filter((r): r is Row & { id: number } => r !== null && r !== undefined);

  const pivotKey = (r: Row) => `${r["covariateId"]}|${r["covariateName"]}`;
  const pivotMap = new Map<string, BinaryCovariate>();

  for (const r of merged) {
    const key = pivotKey(r);
    if (!pivotMap.has(key)) {
      pivotMap.set(key, {
        covariateName: r["covariateName"] as string,
        covariateNameParsed: parseCovariateNameString(
          r["covariateName"] as string,
        ),
        covariateId: r["covariateId"] as number,
      });
    }
    const row = pivotMap.get(key)!;
    const avg = r["averageValue"] as number;
    const sum = r["sumValue"] as number;
    row[`sumValue_${r.id}`] = avg < 0 ? -Math.abs(sum) : sum;
    row[`averageValue_${r.id}`] = avg;
  }

  const res = [...pivotMap.values()];

  for (const row of res) {
    for (const ref of colRef) {
      const avgKey = `averageValue_${ref.id}`;
      const sumKey = `sumValue_${ref.id}`;
      if (row[avgKey] === null || row[avgKey] === undefined)
        row[avgKey] = -1 * minThreshold;
      if (row[sumKey] === null || row[sumKey] === undefined) row[sumKey] = 0;
    }
  }

  const sumCols = Object.keys(res[0] ?? {}).filter((k) =>
    k.startsWith("sumValue_"),
  );
  if (colRef.length === 2 && sumCols.length === 2) {
    for (const row of res) {
      const p1 = Math.abs(row[`averageValue_1`] as number);
      const p2 = Math.abs(row[`averageValue_2`] as number);
      const denom = Math.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / 2);
      row.SMD = denom === 0 ? 0 : (p1 - p2) / denom;
      row.absSMD = Math.abs(row.SMD as number);
    }
  }

  return { covariates: res, covRef: colRef as unknown as CovariateRef[] };
}

export async function getCharacterizationCohortContinuous({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  databaseIds = null,
  minThreshold = 0,
}: CharacterizationCohortOptions): Promise<CharacterizationCohortContinuousResult> {
  let counts = await getCharacterizationTargetCohortCounts({
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

  const colRef: (Row & { id: number })[] = counts.map((r, i) => ({
    ...r,
    id: i + 1,
  }));
  if (colRef.length === 0) return { covariates: [], covRef: [] };

  const params: NamedParams = {};
  const { targetClause, databaseClause: dbClause } = buildCommonFilterClauses(
    { targetIds, databaseIds },
    { target: "ts.target_id", database: "tc.database_id" },
    params,
  );

  const sql = `
    SELECT
      ts.target_id AS cohort_id,
      cr.covariate_name,
      ts.min_prior_observation,
      tc.covariate_id,
      tc.database_id,
      tc.setting_id,
      tc.count_value,
      tc.average_value,
      tc.standard_deviation,
      tc.median_value,
      tc.min_value,
      tc.max_value,
      tc.p_10_value,
      tc.p_25_value,
      tc.p_75_value,
      tc.p_90_value
    FROM ${schema}.${cTablePrefix}target_covariates_continuous tc
    INNER JOIN ${schema}.${cTablePrefix}target_settings ts
      ON tc.characterization_target_id = ts.characterization_target_id
      AND tc.database_id = ts.database_id
      AND tc.setting_id = ts.setting_id
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref cr
      ON tc.covariate_id = cr.covariate_id
      AND tc.database_id = cr.database_id
      AND tc.setting_id = cr.setting_id
    WHERE 1 = 1
      ${targetClause}
      ${dbClause}
  `;

  const rows = await queryDb(sql, params);

  const colRefKey = (r: Row) =>
    `${r["cohortId"]}|${r["databaseId"]}|${r["minPriorObservation"]}`;
  const colRefMap = new Map(colRef.map((r) => [colRefKey(r), r]));

  const merged = rows
    .map((r) => {
      const ref = colRefMap.get(colRefKey(r));
      return ref ? { ...r, id: ref.id } : null;
    })
    .filter((r): r is Row & { id: number } => r !== null && r !== undefined)
    .filter((r) => (r["countValue"] as number) >= minThreshold);

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
  const pivotKey = (r: Row) =>
    `${r["covariateId"]}|${r["covariateName"]}|${r["minPriorObservation"]}`;
  const pivotMap = new Map<string, ContinuousCovariate>();

  for (const r of merged) {
    const key = pivotKey(r);
    if (!pivotMap.has(key)) {
      pivotMap.set(key, {
        covariateName: r["covariateName"] as string,
        covariateNameParsed: parseCovariateNameString(
          r["covariateName"] as string,
        ),
        covariateId: r["covariateId"] as number,
        minPriorObservation: r["minPriorObservation"] as number,
      });
    }
    const row = pivotMap.get(key)!;
    for (const field of valueFields) {
      row[`${field}_${r.id}`] = (r[field] as number) ?? 0;
    }
  }

  const res = [...pivotMap.values()];

  for (const row of res) {
    for (const ref of colRef) {
      for (const field of valueFields) {
        const k = `${field}_${ref.id}`;
        if (row[k] === null || row[k] === undefined) row[k] = 0;
      }
    }
  }

  const countCols = Object.keys(res[0] ?? {}).filter((k) =>
    k.startsWith("countValue_"),
  );
  if (colRef.length === 2 && countCols.length === 2) {
    for (const row of res) {
      const denom = Math.sqrt(
        (Math.abs(row[`standardDeviation_1`] as number) ** 2 +
          Math.abs(row[`standardDeviation_2`] as number) ** 2) /
          2,
      );
      row.SMD =
        denom === 0
          ? 0
          : (Math.abs(row[`averageValue_1`] as number) -
              Math.abs(row[`averageValue_2`] as number)) /
            denom;
      row.absSMD = Math.abs(row.SMD as number);
    }
  }

  return { covariates: res, covRef: colRef as unknown as CovariateRef[] };
}
