import { queryDb } from "../../../../config/postgresDbConnection.js";
import logger from "../../../../utils/logger.js";

function addOptionalClause(condition, clause) {
  return condition ? clause : "";
}

function toArray(v) {
  return Array.isArray(v) ? v : [v];
}

function buildInClause(prefix, values, params) {
  const keys = values.map((_, i) => `@${prefix}${i}`);
  values.forEach((v, i) => {
    params[`${prefix}${i}`] = v;
  });
  return keys.join(",");
}

function pivotType(rows, fillCols) {
  const map = new Map();
  for (const r of rows) {
    const key = `${r.cohortDefinitionId}|${r.cohortName}`;
    if (!map.has(key))
      map.set(key, {
        cohortName: r.cohortName,
        cohortDefinitionId: r.cohortDefinitionId,
      });
    map.get(key)[r.type] = r.value;
  }
  const result = [...map.values()];
  for (const row of result) {
    for (const col of fillCols) {
      if (row[col] == null) row[col] = 0;
    }
  }
  return result;
}

async function safeQuery(sql, params) {
  try {
    return await queryDb(sql, params);
  } catch (e) {
    console.warn(e.message);
    return null;
  }
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {boolean} [options.printTimes=false]
 * @param {boolean} [options.useTte=true]
 * @param {boolean} [options.useDcrc=true]
 * @param {boolean} [options.useRf=true]
 * @returns {Promise<object[]|null>}
 */
export async function getCharacterizationTargets({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  printTimes = false,
  useTte = true,
  useDcrc = true,
  useRf = true,
}) {
  const totalStart = Date.now();
  const allRows = [];

  if (useTte) {
    const start = Date.now();
    let tableOrView;
    try {
      await queryDb(
        `SELECT * FROM ${schema}.${cTablePrefix}time_to_event_targets LIMIT 1`,
      );
      tableOrView = `${schema}.${cTablePrefix}time_to_event_targets`;
    } catch {
      tableOrView = `(SELECT DISTINCT target_cohort_definition_id FROM ${schema}.${cTablePrefix}time_to_event)`;
    }

    const tteRows = await safeQuery(`
      SELECT
        cg.cohort_name,
        tte.target_cohort_definition_id AS cohort_definition_id,
        'timeToEvent' AS type,
        1 AS value
      FROM ${tableOrView} tte
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON tte.target_cohort_definition_id = cg.cohort_definition_id
    `);
    if (tteRows) allRows.push(...tteRows);
    if (printTimes)
      console.log(`extracting time_to_event data: ${Date.now() - start}ms`);
  }

  if (useDcrc) {
    const start = Date.now();
    const dcrcRows = await safeQuery(`
      SELECT
        cg.cohort_name,
        dr.target_cohort_definition_id AS cohort_definition_id,
        'dechalRechal' AS type,
        1 AS value
      FROM (SELECT DISTINCT target_cohort_definition_id FROM ${schema}.${cTablePrefix}dechallenge_rechallenge) dr
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON dr.target_cohort_definition_id = cg.cohort_definition_id
    `);
    if (dcrcRows) allRows.push(...dcrcRows);
    if (printTimes)
      console.log(
        `extracting dechallenge_rechallenge data: ${Date.now() - start}ms`,
      );
  }

  if (useRf) {
    let start = Date.now();
    const rfRows1 = await safeQuery(`
      SELECT
        cg.cohort_name,
        cd.target_cohort_id AS cohort_definition_id,
        'riskFactors' AS type,
        1 AS value
      FROM (SELECT DISTINCT target_cohort_id FROM ${schema}.${cTablePrefix}cohort_details WHERE cohort_type IN ('Cases')) cd
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON cd.target_cohort_id = cg.cohort_definition_id
    `);
    if (rfRows1) allRows.push(...rfRows1);
    if (printTimes)
      console.log(`extracting risk factor data: ${Date.now() - start}ms`);

    start = Date.now();
    const rfRows2 = await safeQuery(`
      SELECT
        cg.cohort_name,
        cd.target_cohort_id AS cohort_definition_id,
        'databaseComparator' AS type,
        1 AS value
      FROM (SELECT DISTINCT target_cohort_id FROM ${schema}.${cTablePrefix}cohort_details WHERE cohort_type IN ('Target')) cd
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON cd.target_cohort_id = cg.cohort_definition_id
    `);
    if (rfRows2) allRows.push(...rfRows2);
    if (printTimes)
      console.log(
        `extracting database comparator data: ${Date.now() - start}ms`,
      );
  }

  if (allRows.length === 0) {
    console.log("No target data");
    console.log(
      `-- all extracting characterization targets took: ${Date.now() - totalStart}ms`,
    );
    return null;
  }

  const colTypes = [
    "timeToEvent",
    "dechalRechal",
    "riskFactors",
    "databaseComparator",
  ];
  const targets = pivotType(allRows, colTypes);

  for (const t of targets) {
    t.caseSeries = t.riskFactors;
    t.cohortComparator = t.databaseComparator;
  }

  console.log(
    `-- all extracting characterization targets took: ${Date.now() - totalStart}ms`,
  );
  return targets;
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {number} [options.targetId]
 * @param {boolean} [options.printTimes=false]
 * @param {boolean} [options.useTte=true]
 * @param {boolean} [options.useDcrc=true]
 * @param {boolean} [options.useRf=true]
 * @returns {Promise<object[]|null>}
 */
export async function getCharacterizationOutcomes({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  targetId = null,
  useTte = true,
  useDcrc = true,
  useRf = true,
}) {
  const allRows = [];

  const params = {};
  const targetClause = addOptionalClause(
    targetId != null,
    `WHERE tte.target_cohort_definition_id IN (${buildInClause("targetId", toArray(targetId ?? []), params)})`,
  );
  const drTargetClause = addOptionalClause(
    targetId != null,
    `WHERE dr.target_cohort_definition_id IN (${(targetId != null ? toArray(targetId) : []).map((_, i) => `@targetId${i}`).join(",")})`,
  );
  const cdTargetClause = addOptionalClause(
    targetId != null,
    `AND cd.target_cohort_id IN (${(targetId != null ? toArray(targetId) : []).map((_, i) => `@targetId${i}`).join(",")})`,
  );

  const detailParams = {};
  const detailTargetClause = addOptionalClause(
    targetId != null,
    `AND target_cohort_id IN (${buildInClause("dtTargetId", toArray(targetId ?? []), detailParams)})`,
  );

  const [tteRows, dcrcRows, rfRows, detailRows] = await Promise.all([
    useTte
      ? safeQuery(
          `
      SELECT
        cg.cohort_name,
        tte.outcome_cohort_definition_id AS cohort_definition_id,
        'timeToEvent' AS type,
        1 AS value
      FROM ${schema}.${cTablePrefix}time_to_event tte
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON tte.outcome_cohort_definition_id = cg.cohort_definition_id
      ${targetClause}
      GROUP BY cg.cohort_name, tte.outcome_cohort_definition_id
    `,
          params,
        )
      : null,
    useDcrc
      ? safeQuery(
          `
      SELECT
        cg.cohort_name,
        dr.outcome_cohort_definition_id AS cohort_definition_id,
        'dechalRechal' AS type,
        1 AS value
      FROM ${schema}.${cTablePrefix}dechallenge_rechallenge dr
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON dr.outcome_cohort_definition_id = cg.cohort_definition_id
      ${drTargetClause}
      GROUP BY cg.cohort_name, dr.outcome_cohort_definition_id
    `,
          params,
        )
      : null,
    useRf
      ? safeQuery(
          `
      SELECT
        cg.cohort_name,
        cd.outcome_cohort_id AS cohort_definition_id,
        'riskFactors' AS type,
        1 AS value
      FROM ${schema}.${cTablePrefix}cohort_details cd
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON cd.outcome_cohort_id = cg.cohort_definition_id
      WHERE cd.cohort_type = 'Cases'
        ${cdTargetClause}
      GROUP BY cg.cohort_name, cd.outcome_cohort_id
    `,
          params,
        )
      : null,
    useRf
      ? safeQuery(
          `
      SELECT DISTINCT
        outcome_cohort_id AS cohort_definition_id,
        risk_window_start,
        risk_window_end,
        start_anchor,
        end_anchor,
        outcome_washout_days
      FROM ${schema}.${cTablePrefix}cohort_counts
      WHERE outcome_cohort_id IS NOT NULL
        AND outcome_cohort_id != 0
        ${detailTargetClause}
    `,
          detailParams,
        )
      : null,
  ]);

  if (tteRows) allRows.push(...tteRows);
  if (dcrcRows) allRows.push(...dcrcRows);
  if (rfRows) allRows.push(...rfRows);

  if (allRows.length === 0) {
    return null;
  }

  const colTypes = ["timeToEvent", "dechalRechal", "riskFactors"];
  const outcomes = pivotType(allRows, colTypes);

  for (const o of outcomes) {
    o.caseSeries = o.riskFactors;
  }

  if (useRf && detailRows) {
    const groups = new Map();
    for (const r of detailRows) {
      if (!groups.has(r.cohortDefinitionId))
        groups.set(r.cohortDefinitionId, []);
      groups.get(r.cohortDefinitionId).push(r);
    }

    const detailMap = new Map();
    for (const [id, rows] of groups) {
      const tarNames = [
        ...new Set(
          rows.map(
            (r) =>
              `(${r.startAnchor} + ${r.riskWindowStart}) - (${r.endAnchor} + ${r.riskWindowEnd})`,
          ),
        ),
      ];
      const tarStrings = [
        ...new Set(
          rows.map(
            (r) =>
              `${r.riskWindowStart}/${r.startAnchor}/${r.riskWindowEnd}/${r.endAnchor}`,
          ),
        ),
      ];
      const washouts = [...new Set(rows.map((r) => r.outcomeWashoutDays))];

      detailMap.set(id, {
        tarNames: tarNames.join(":"),
        tarStrings: tarStrings.join(":"),
        outcomeWashoutDays: washouts.join(":"),
      });
    }

    for (const o of outcomes) {
      const detail = detailMap.get(o.cohortDefinitionId);
      if (detail) Object.assign(o, detail);
    }
  }

  return outcomes;
}
