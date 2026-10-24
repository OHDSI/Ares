export type GeoLevel = "county" | "state" | "country";
export type GeoStat = "MEAN_VALUE" | "MEDIAN_VALUE" | "P90_VALUE";
export type RegionIdScheme =
  "us_fips" | "us_state_abbr" | "iso3166_1" | "iso3166_2" | "nuts" | "custom";

export interface GeoManifest {
  schemaVersion: number;
  levels: GeoLevel[];
  regionIdScheme: Partial<Record<GeoLevel, RegionIdScheme>>;
  periodGranularity: "year";
  periodMin: number;
  periodMax: number;
  minCellCount: number;
  nExposures: number;
  hasResidency: boolean;
  boundaries: Partial<Record<GeoLevel, string | null>>;
  files: Record<string, string>;
}

export interface GeoExposureConcept {
  EXPOSURE_CONCEPT_ID: number;
  EXPOSURE_NAME: string;
  UNIT_NAME: string;
  GLOBAL_MIN: number | null;
  GLOBAL_MAX: number | null;
  PERIOD_MIN: number;
  PERIOD_MAX: number;
  N_REGIONS: number;
}

export interface GeoRegion {
  REGION_ID: string;
  REGION_NAME: string;
  PARENT_REGION_ID: string | null;
  CENTROID_LAT: number | null;
  CENTROID_LON: number | null;
}

export interface GeoSummaryRow {
  REGION_ID: string;
  EXPOSURE_CONCEPT_ID: number;
  PERIOD: number;
  N_PERSONS: number | null;
  N_RECORDS: number | null;
  MEAN_VALUE: number | null;
  P10_VALUE: number | null;
  P25_VALUE: number | null;
  MEDIAN_VALUE: number | null;
  P75_VALUE: number | null;
  P90_VALUE: number | null;
  SUPPRESSED: boolean;
}

export interface GeoResidencyRow {
  REGION_ID: string;
  PERIOD: number;
  N_PERSONS_RESIDENT: number | null;
}

/** A boundary feature reduced to what the map needs. */
export interface GeoBoundaries {
  /** echarts map name, unique per source file */
  mapName: string;
  geoJson: any;
  /** region id -> display position (planar, same space as the polygons) */
  centers: Map<string, [number, number]>;
  /** region id -> [minX, minY, maxX, maxY] */
  boxes: Map<string, [number, number, number, number]>;
  /** [minX, minY, maxX, maxY] of all features */
  bounds: [number, number, number, number];
  aspectScale: number;
  /** region id -> feature name, used when the export only carries codes */
  names: Map<string, string>;
}
