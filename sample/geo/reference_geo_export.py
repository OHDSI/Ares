import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import duckdb

PERSON_DOMAIN = 1147314


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cdm", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--min-cell-count", type=int, default=11)
    a = ap.parse_args()
    cdm, geo = Path(a.cdm), Path(a.out) / "geo"
    geo.mkdir(parents=True, exist_ok=True)
    mc = a.min_cell_count

    con = duckdb.connect()
    for t in ("location", "location_history", "external_exposure", "concept"):
        src = cdm / f"{t}.csv"
        if not src.exists():
            src = cdm / f"{t}.csv.gz"  # gzip is fine too
        con.execute(f"CREATE TABLE {t} AS SELECT * FROM read_csv_auto('{src}', all_varchar=false)")

    # --- extraction (mirrors the sqlGeo*.sql files) ---
    con.execute("""CREATE TABLE person_year AS
        SELECT ee.exposure_concept_id, CAST(l.county_fips AS VARCHAR) AS county_id, l.state AS state_id,
               l.country_source_value AS country_id,
               YEAR(ee.exposure_start_date) AS period, ee.person_id,
               COUNT(*) AS n_records, AVG(ee.value_as_number) AS value_mean
        FROM external_exposure ee JOIN location l ON l.location_id = ee.location_id
        WHERE ee.value_as_number IS NOT NULL
        GROUP BY ALL""")
    con.execute("""CREATE TABLE units AS
        SELECT exposure_concept_id, CAST(unit_concept_id AS BIGINT) AS unit_concept_id, COUNT(*) AS n_records
        FROM external_exposure WHERE value_as_number IS NOT NULL GROUP BY ALL""")
    con.execute("""CREATE TABLE locations AS
        SELECT CAST(county_fips AS VARCHAR) AS county_id, state AS state_id, country_source_value AS country_id,
               MAX(county) AS county_name,
               AVG(latitude) AS latitude, AVG(longitude) AS longitude, COUNT(*) AS n_locations
        FROM location GROUP BY ALL""")
    con.execute(f"""CREATE TABLE residency AS
        SELECT CAST(l.county_fips AS VARCHAR) AS county_id, l.state AS state_id,
               l.country_source_value AS country_id, lh.entity_id AS person_id,
               YEAR(lh.start_date) AS start_year, YEAR(lh.end_date) AS end_year
        FROM location_history lh JOIN location l ON l.location_id = lh.location_id
        WHERE lh.domain_id = {PERSON_DOMAIN}""")
    con.execute("CREATE TABLE concept_names AS SELECT concept_id, concept_name FROM concept")
    # empty county ids are NULL, like in the CDM
    con.execute("UPDATE person_year SET county_id = NULL WHERE county_id = ''")
    con.execute("UPDATE locations SET county_id = NULL WHERE county_id = ''")
    con.execute("UPDATE residency SET county_id = NULL WHERE county_id = ''")

    # --- aggregation (same SQL as buildGeoTables in R) ---
    # a level is exported only when its id column has values
    levels = {
        lv: col
        for lv, col in {"county": "county_id", "state": "state_id", "country": "country_id"}.items()
        if con.execute(f"SELECT COUNT({col}) FROM person_year").fetchone()[0] > 0
    }
    con.execute("CREATE TABLE person_region AS " + " UNION ALL ".join(
        f"""SELECT '{lv}' AS region_level, {col} AS region_id, exposure_concept_id, period, person_id,
                   SUM(n_records) AS n_records, SUM(value_mean * n_records) / SUM(n_records) AS value_mean
            FROM person_year WHERE {col} IS NOT NULL GROUP BY ALL""" for lv, col in levels.items()))
    sup = f"n_persons < {mc}"
    con.execute(f"""CREATE TABLE exposure_summary AS
        WITH agg AS (
          SELECT region_level, region_id, exposure_concept_id, period, COUNT(*) AS n_persons,
                 SUM(n_records) AS n_records, AVG(value_mean) AS mean_value,
                 quantile_cont(value_mean, 0.10) AS p10_value, quantile_cont(value_mean, 0.25) AS p25_value,
                 quantile_cont(value_mean, 0.50) AS median_value, quantile_cont(value_mean, 0.75) AS p75_value,
                 quantile_cont(value_mean, 0.90) AS p90_value
          FROM person_region GROUP BY ALL)
        SELECT region_level AS REGION_LEVEL, region_id AS REGION_ID, exposure_concept_id AS EXPOSURE_CONCEPT_ID,
               period AS PERIOD,
               CASE WHEN {sup} THEN NULL ELSE n_persons END AS N_PERSONS,
               CASE WHEN {sup} THEN NULL ELSE n_records END AS N_RECORDS,
               CASE WHEN {sup} THEN NULL ELSE mean_value END AS MEAN_VALUE,
               CASE WHEN {sup} THEN NULL ELSE p10_value END AS P10_VALUE,
               CASE WHEN {sup} THEN NULL ELSE p25_value END AS P25_VALUE,
               CASE WHEN {sup} THEN NULL ELSE median_value END AS MEDIAN_VALUE,
               CASE WHEN {sup} THEN NULL ELSE p75_value END AS P75_VALUE,
               CASE WHEN {sup} THEN NULL ELSE p90_value END AS P90_VALUE,
               {sup} AS SUPPRESSED
        FROM agg""")
    lo, hi = con.execute("SELECT MIN(period), MAX(period) FROM person_year").fetchone()
    con.execute("CREATE TABLE residency_summary AS SELECT region_level AS REGION_LEVEL, region_id AS REGION_ID, "
                f"period AS PERIOD, CASE WHEN {sup} THEN NULL ELSE n_persons END AS N_PERSONS_RESIDENT, {sup} AS SUPPRESSED FROM ("
                + " UNION ALL ".join(
        f"""SELECT '{lv}' AS region_level, {col} AS region_id, t.period AS period,
                   COUNT(DISTINCT person_id) AS n_persons
            FROM residency, UNNEST(generate_series(GREATEST(start_year, {lo}),
                 LEAST(COALESCE(end_year, {hi}), {hi}))) AS t(period)
            WHERE {col} IS NOT NULL GROUP BY ALL""" for lv, col in levels.items()) + ")")
    loc_sql = {
        "county": """SELECT 'county' AS region_level, county_id AS region_id, MAX(county_name) AS region_name,
                  MAX(state_id) AS parent_region_id, SUM(latitude * n_locations) / SUM(n_locations) AS lat,
                  SUM(longitude * n_locations) / SUM(n_locations) AS lon, SUM(n_locations) AS n_locations
           FROM locations WHERE county_id IS NOT NULL GROUP BY county_id""",
        "state": """SELECT 'state' AS region_level, state_id AS region_id, state_id AS region_name,
                  MAX(country_id) AS parent_region_id, SUM(latitude * n_locations) / SUM(n_locations) AS lat,
                  SUM(longitude * n_locations) / SUM(n_locations) AS lon, SUM(n_locations) AS n_locations
           FROM locations WHERE state_id IS NOT NULL GROUP BY state_id""",
        "country": """SELECT 'country' AS region_level, country_id AS region_id, country_id AS region_name,
                  NULL AS parent_region_id, SUM(latitude * n_locations) / SUM(n_locations) AS lat,
                  SUM(longitude * n_locations) / SUM(n_locations) AS lon, SUM(n_locations) AS n_locations
           FROM locations WHERE country_id IS NOT NULL GROUP BY country_id""",
    }
    con.execute("CREATE TABLE loc AS " + " UNION ALL ".join(loc_sql[lv] for lv in levels))
    con.execute(f"""CREATE TABLE region AS
        WITH seen AS (SELECT DISTINCT REGION_LEVEL, REGION_ID FROM exposure_summary
                      UNION SELECT DISTINCT REGION_LEVEL, REGION_ID FROM residency_summary)
        SELECT s.REGION_LEVEL, s.REGION_ID, COALESCE(l.region_name, s.REGION_ID) AS REGION_NAME,
               l.parent_region_id AS PARENT_REGION_ID,
               CASE WHEN l.n_locations >= {mc} THEN ROUND(l.lat, 2) END AS CENTROID_LAT,
               CASE WHEN l.n_locations >= {mc} THEN ROUND(l.lon, 2) END AS CENTROID_LON
        FROM seen s LEFT JOIN loc l ON l.region_level = s.REGION_LEVEL AND l.region_id = s.REGION_ID""")
    con.execute("""CREATE TABLE unit_pick AS SELECT exposure_concept_id, unit_concept_id FROM (
        SELECT exposure_concept_id, unit_concept_id,
               ROW_NUMBER() OVER (PARTITION BY exposure_concept_id ORDER BY n_records DESC) AS rn
        FROM units WHERE unit_concept_id IS NOT NULL AND unit_concept_id <> 0) WHERE rn = 1""")
    con.execute("""CREATE TABLE exposure_concept AS
        SELECT e.EXPOSURE_CONCEPT_ID,
               COALESCE(cn.concept_name, 'Concept ' || e.EXPOSURE_CONCEPT_ID) AS EXPOSURE_NAME,
               'continuous' AS VALUE_KIND, COALESCE(u.unit_concept_id, 0) AS UNIT_CONCEPT_ID,
               COALESCE(un.concept_name, '') AS UNIT_NAME,
               MIN(e.P10_VALUE) AS GLOBAL_MIN, MAX(e.P90_VALUE) AS GLOBAL_MAX,
               MIN(e.PERIOD) AS PERIOD_MIN, MAX(e.PERIOD) AS PERIOD_MAX,
               COUNT(DISTINCT CASE WHEN NOT e.SUPPRESSED THEN e.REGION_ID END) AS N_REGIONS
        FROM exposure_summary e
        LEFT JOIN concept_names cn ON cn.concept_id = e.EXPOSURE_CONCEPT_ID
        LEFT JOIN unit_pick u ON u.exposure_concept_id = e.EXPOSURE_CONCEPT_ID
        LEFT JOIN concept_names un ON un.concept_id = u.unit_concept_id GROUP BY ALL""")

    files = {"region": "geo_region.parquet", "exposureConcept": "geo_exposure_concept.parquet",
             "exposureSummary": "geo_exposure_summary.parquet", "residency": "geo_residency.parquet"}
    for key, table, order in (("region", "region", "1, 2"), ("exposureConcept", "exposure_concept", "1"),
                              ("exposureSummary", "exposure_summary", "1, 3, 4, 2"),
                              ("residency", "residency_summary", "1, 3, 2")):
        con.execute(f"COPY (SELECT * FROM {table} ORDER BY {order}) TO '{geo / files[key]}' (FORMAT PARQUET)")
    n_exp = con.execute("SELECT COUNT(*) FROM exposure_concept").fetchone()[0]
    manifest = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "levels": [lv for lv in ("county", "state", "country") if lv in levels],
        "regionIdScheme": {k: v for k, v in {"county": "us_fips", "state": "us_state_abbr",
                           "country": "iso3166_1"}.items() if k in levels},
        "periodGranularity": "year", "periodMin": lo, "periodMax": hi, "minCellCount": mc,
        "nExposures": n_exp, "hasResidency": True,
        "boundaries": {lv: None for lv in levels}, "files": files,
    }
    (geo / "geo_manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"wrote {geo} ({n_exp} exposures, periods {lo}-{hi})")


if __name__ == "__main__":
    main()
