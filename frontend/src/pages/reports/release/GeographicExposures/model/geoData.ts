import db from "@/shared/api/duckdb/instance";
import getDuckDBFilePath, {
  getBaseUrl,
  GEO_EXPOSURE_CONCEPT,
  GEO_EXPOSURE_SUMMARY,
  GEO_REGION,
  GEO_RESIDENCY,
} from "@/shared/api/duckdb/files";
import type {
  GeoBoundaries,
  GeoExposureConcept,
  GeoLevel,
  GeoManifest,
  GeoRegion,
  RegionIdScheme,
  GeoResidencyRow,
  GeoSummaryRow,
} from "./types";

interface ReleaseRef {
  cdm: string;
  release: string;
}

// duckdb-wasm hands back bigint for integer columns; the report only needs plain numbers
function normalize<T>(rows: any[]): T[] {
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      row.toJSON ? row.toJSON() : row,
    )) {
      out[key] = typeof value === "bigint" ? Number(value) : value;
    }
    return out as T;
  });
}

async function query<T>(sql: string): Promise<T[]> {
  const conn = await db.connect();
  try {
    const table = await conn.query(sql);
    return normalize<T>(table.toArray());
  } finally {
    await conn.close();
  }
}

const quote = (s: string) => s.replace(/'/g, "''");

function files(ref: ReleaseRef) {
  return getDuckDBFilePath({ cdm: ref.cdm, release: ref.release });
}

export function loadExposureConcepts(ref: ReleaseRef) {
  return query<GeoExposureConcept>(
    `SELECT * FROM read_parquet('${quote(files(ref)[GEO_EXPOSURE_CONCEPT])}') ORDER BY EXPOSURE_NAME`,
  );
}

export function loadRegions(ref: ReleaseRef, level: GeoLevel) {
  return query<GeoRegion>(
    `SELECT * FROM read_parquet('${quote(files(ref)[GEO_REGION])}') WHERE REGION_LEVEL = '${level}'`,
  );
}

export function loadSummary(ref: ReleaseRef, level: GeoLevel) {
  return query<GeoSummaryRow>(
    `SELECT * FROM read_parquet('${quote(files(ref)[GEO_EXPOSURE_SUMMARY])}') WHERE REGION_LEVEL = '${level}'`,
  );
}

export function loadResidency(ref: ReleaseRef, level: GeoLevel) {
  return query<GeoResidencyRow>(
    `SELECT * FROM read_parquet('${quote(files(ref)[GEO_RESIDENCY])}') WHERE REGION_LEVEL = '${level}'`,
  );
}

function bbox(geometry: any): [number, number, number, number] {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const walk = (c: any) => {
    if (typeof c[0] === "number") {
      minX = Math.min(minX, c[0]);
      maxX = Math.max(maxX, c[0]);
      minY = Math.min(minY, c[1]);
      maxY = Math.max(maxY, c[1]);
    } else c.forEach(walk);
  };
  walk(geometry.coordinates);
  return [minX, minY, maxX, maxY];
}

/**
 * Boundary resolution order: file shipped in the release's geo folder, then the US boundaries
 * bundled with ARES (only when region ids are FIPS codes / state abbreviations), else none and the
 * report falls back to a centroid scatter.
 */
/**
 * Boundary packs bundled with ARES (frontend/public/geo), by region id scheme. `key` is the
 * feature property that holds the region id. Add new schemes here (e.g. nuts, iso3166_2) together
 * with a pack built by sample/geo/build_*_boundaries.py.
 */
const BUNDLED_BOUNDARIES: Partial<
  Record<RegionIdScheme, { file: string; key: "id" | "abbr" }>
> = {
  us_fips: { file: "us_county.geojson", key: "id" },
  us_state_abbr: { file: "us_state.geojson", key: "abbr" },
  iso3166_1: { file: "world_country.geojson", key: "id" },
};

export async function loadBoundaries(
  ref: ReleaseRef,
  manifest: GeoManifest,
  level: GeoLevel,
): Promise<GeoBoundaries | null> {
  const scheme = manifest.regionIdScheme?.[level] ?? "custom";
  const releaseFile = manifest.boundaries?.[level];
  const base = getBaseUrl();
  const bundled = BUNDLED_BOUNDARIES[scheme];
  let url: string | null = null;
  let keyProperty: "id" | "abbr" = "id";
  if (releaseFile) {
    url = `${base}/data/${ref.cdm}/${ref.release}/geo/${releaseFile}`;
  } else if (bundled) {
    url = `${base}/geo/${bundled.file}`;
    keyProperty = bundled.key;
  }
  if (!url) return null;

  const response = await fetch(url);
  if (!response.ok) return null;
  const geoJson = await response.json();

  const centers = new Map<string, [number, number]>();
  const boxes = new Map<string, [number, number, number, number]>();
  const names = new Map<string, string>();
  const bounds: [number, number, number, number] = [
    Infinity,
    Infinity,
    -Infinity,
    -Infinity,
  ];
  for (const feature of geoJson.features) {
    const box = bbox(feature.geometry);
    bounds[0] = Math.min(bounds[0], box[0]);
    bounds[1] = Math.min(bounds[1], box[1]);
    bounds[2] = Math.max(bounds[2], box[2]);
    bounds[3] = Math.max(bounds[3], box[3]);
    const p = feature.properties ?? {};
    const key = String(p[keyProperty] ?? p.id ?? p.name);
    p.__key = key;
    boxes.set(key, box);
    if (p.name) names.set(key, String(p.name));
    centers.set(
      key,
      typeof p.cx === "number" && typeof p.cy === "number"
        ? [p.cx, p.cy]
        : [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2],
    );
  }
  return {
    mapName: `geo_${ref.cdm}_${ref.release}_${level}`,
    geoJson,
    centers,
    boxes,
    names,
    bounds,
    // plain lon/lat files need the usual latitude squash; projected packs are already planar
    aspectScale:
      geoJson.ares?.aspectScale ?? (scheme === "iso3166_1" ? 0.75 : 1),
  };
}
