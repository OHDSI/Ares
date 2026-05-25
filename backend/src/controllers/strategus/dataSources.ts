import { queryDb } from "#config/db.js";
import type { DataSource } from "#types/index.js";

export async function getDatasources({
  schema,
  databaseTable = "database_meta_data",
}: {
  schema: string;
  databaseTable?: string;
}): Promise<DataSource[]> {
  const sql = `
    SELECT
      database_id,
      cdm_source_name,
      cdm_source_abbreviation,
      cdm_holder,
      source_description,
      source_documentation_reference,
      cdm_etl_reference,
      source_release_date,
      cdm_release_date,
      cdm_version,
      cdm_version_concept_id,
      vocabulary_version,
      max_obs_period_end_date
    FROM ${schema}.${databaseTable}
    ORDER BY cdm_source_abbreviation
  `;

  return queryDb(sql) as unknown as Promise<DataSource[]>;
}
