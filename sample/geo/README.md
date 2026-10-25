# Geographic exposures sample

Synthetic data for developing and testing the **Geographic Exposures** report and Achilles'
`exportGeoToAres()`. Persons, residences and exposure values are random draws over real US
counties; nothing here describes real people. Exposure and type concepts are the real OHDSI
GIS / SDOH vocabulary ids (see `generate_geo_sample.py`).

| File | Purpose |
|---|---|
| `build_boundaries.py` | Builds `frontend/public/geo/us_{county,state}.geojson` (Census cartographic boundaries, Albers-USA layout with Alaska/Hawaii insets) and `ref/county_ref.csv`. Needs `pyshp`, `shapely`. |
| `generate_geo_sample.py` | Writes a CDM extract (`location`, `location_history`, `external_exposure`, `concept`, `cdm_source`). `--mini` is the 400-person fixture committed to Achilles. Needs `numpy`. |
| `build_world_boundaries.py` | Builds `frontend/public/geo/world_country.geojson` (Natural Earth 1:50m, ISO 3166-1 alpha-2 ids). |
| `reference_geo_export.py` | Python reference of `exportGeoToAres()`; produces the `geo/` folder from the CSV extract. Needs `duckdb`. |
| `data/geo/` | Committed output for the full sample: 30k persons, 2015-2023, six exposures. US Great Lakes states (county, state and country levels) plus ~55 other countries (country level only). |
| `merge_ares_source.py` | Merges the sources of another ARES data folder (e.g. Achilles `exportToAres()` + AresIndexer output) into the data folder the frontend serves, including `index.json`. |
| `install_sample.sh` | Copies `data/geo/` into `frontend/public/data/Synthea/20241021/geo` (unzipping `sample/frontend/data.zip` first if needed). |

## Quick start

```sh
sample/geo/install_sample.sh
pnpm --filter=./frontend run serve     # open Synthea / 2024-10-21 / Geographic Exposures
```

## Regenerating

```sh
python sample/geo/generate_geo_sample.py --out /tmp/geo_cdm   # --world: only non-US countries
python sample/geo/reference_geo_export.py --cdm /tmp/geo_cdm --out /tmp/geo_out
cp /tmp/geo_out/geo/* sample/geo/data/geo/
```

The sample deliberately includes: counties below the suppression threshold, people who move
between counties mid-period, a 60%-coverage exposure (ozone), an exposure that starts late
(green space), locations without a county id, and people without a `location_history` row.

Note the sample sits under the existing Synthea release for convenience; its person counts do not
match that release's other reports.

## Output files (schema version 1)

All under `data/{source}/{release}/geo/`; columns are upper case like the other ARES parquet files.

- `geo_manifest.json`: levels, region id schemes, period range, `minCellCount`, boundary files.
- `geo_region.parquet`: `REGION_LEVEL, REGION_ID, REGION_NAME, PARENT_REGION_ID, CENTROID_LAT, CENTROID_LON`
- `geo_exposure_concept.parquet`: `EXPOSURE_CONCEPT_ID, EXPOSURE_NAME, VALUE_KIND, UNIT_CONCEPT_ID, UNIT_NAME, GLOBAL_MIN, GLOBAL_MAX, PERIOD_MIN, PERIOD_MAX, N_REGIONS`
- `geo_exposure_summary.parquet`: `REGION_LEVEL, REGION_ID, EXPOSURE_CONCEPT_ID, PERIOD, N_PERSONS, N_RECORDS, MEAN_VALUE, P10_VALUE, P25_VALUE, MEDIAN_VALUE, P75_VALUE, P90_VALUE, SUPPRESSED`
- `geo_residency.parquet` (optional): `REGION_LEVEL, REGION_ID, PERIOD, N_PERSONS_RESIDENT, SUPPRESSED`
- optional `boundaries_{level}.geojson`; each feature needs `properties.id` equal to the region id.

## Regions outside the US

Levels are `county`, `state` and `country`; each has a `regionIdScheme` in the manifest, which
selects the boundary pack the frontend uses (`BUNDLED_BOUNDARIES` in
`GeographicExposures/model/geoData.ts`):

| Scheme | Bundled pack | Feature key |
|---|---|---|
| `us_fips` | `us_county.geojson` | `id` (5-digit FIPS) |
| `us_state_abbr` | `us_state.geojson` | `abbr` |
| `iso3166_1` | `world_country.geojson` | `id` (alpha-2) |
| `iso3166_2`, `nuts`, `custom` | none yet; ship `boundaries_{level}.geojson` with the release | `id` |

To add a scheme: build a pack (as in `build_world_boundaries.py`: `id`, `name`, optional `cx`/`cy`),
add one line to `BUNDLED_BOUNDARIES`. Packs in plain lon/lat can set a top-level
`"ares": {"aspectScale": 0.75}`. State/province ids must be globally unique once several
countries are mixed (use ISO 3166-2, e.g. `CA-ON`).

Not done yet: Achilles' `exportGeoToAres()` only has county and state levels; the Python
reference already reads `location.country_source_value` for the country level.

## Hosting as a static demo

The app works from any URL prefix (data URLs are derived from the page path), so a build with
`vite build --base=/<prefix>/` can be published on GitHub Pages. The OHDSI/GIS repository does this
at `<site>/ares-demo/` from its `static.yml` workflow: it builds ARES, installs this sample as
Synthea, and merges the GIS tutorial dataset (a full Achilles, DQD and `exportToAres()` run) with `merge_ares_source.py`.
