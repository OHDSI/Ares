import { queryDb } from '../../config/postgresDbConnection.js';

/**
 * Fetches all database metadata rows.
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.databaseTable='database_meta_data']
 * @returns {Promise<object[]>}
 */
export async function getDatasources({
                                         schema,
                                         databaseTable = 'database_meta_data',
                                     }) {
    const sql = `
    SELECT
      database_id,
      database_full_name,
      database_name,
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
    ORDER BY database_name
  `;

    return queryDb(sql);
}