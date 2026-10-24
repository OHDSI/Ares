import argparse
import csv
import io
import json
import math
import urllib.request
import zipfile
from pathlib import Path

import shapefile  # pyshp
from shapely.geometry import MultiPolygon, Polygon, mapping, shape
from shapely.ops import transform, unary_union

BASE = "https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_us_{}_20m.zip"
ROOT = Path(__file__).resolve().parents[2]
SCALE = 1000.0  # planar units per earth radius
LOWER48_EXCLUDE = {"02", "15"}
KEEP_MAX_STATEFP = 56  # 50 states + DC; territories are not drawn


def albers(lat1, lat2, lat0, lon0):
    r1, r2, r0, l0 = map(math.radians, (lat1, lat2, lat0, lon0))
    n = (math.sin(r1) + math.sin(r2)) / 2
    c = math.cos(r1) ** 2 + 2 * n * math.sin(r1)
    rho0 = math.sqrt(c - 2 * n * math.sin(r0)) / n

    def project(lon, lat):
        rl = math.radians(lon)
        # unwrap across the antimeridian relative to the central meridian
        d = (rl - l0 + math.pi) % (2 * math.pi) - math.pi
        rho = math.sqrt(c - 2 * n * math.sin(math.radians(lat))) / n
        th = n * d
        return rho * math.sin(th), rho0 - rho * math.cos(th)

    return project


P_L48 = albers(29.5, 45.5, 37.5, -96)
P_AK = albers(55, 65, 50, -154)
P_HI = albers(8, 18, 3, -157)
# Insets: (projection, scale, (left, top) of the inset bounding box in planar units)
INSETS = {
    "02": (P_AK, 0.35, (-330.0, -215.0)),
    "15": (P_HI, 1.0, (-120.0, -215.0)),
}
OFFSETS = {}  # statefp -> (dx, dy), filled from the state geometry


def make_projector(statefp):
    if statefp in INSETS:
        proj, k, _ = INSETS[statefp]
        dx, dy = OFFSETS.get(statefp, (0.0, 0.0))
        return lambda lon, lat: tuple(
            v * k * SCALE + o for v, o in zip(proj(lon, lat), (dx, dy))
        )
    return lambda lon, lat: tuple(v * SCALE for v in P_L48(lon, lat))


def load(kind, cache):
    cache.mkdir(parents=True, exist_ok=True)
    zpath = cache / f"{kind}.zip"
    if not zpath.exists():
        urllib.request.urlretrieve(BASE.format(kind), zpath)
    with zipfile.ZipFile(zpath) as z:
        names = {n.rsplit(".", 1)[-1]: n for n in z.namelist()}
        rdr = shapefile.Reader(
            shp=io.BytesIO(z.read(names["shp"])),
            dbf=io.BytesIO(z.read(names["dbf"])),
            shx=io.BytesIO(z.read(names["shx"])),
        )
        fields = [f[0] for f in rdr.fields[1:]]
        return [
            (dict(zip(fields, rec)), shape(sh.__geo_interface__))
            for rec, sh in zip(rdr.records(), rdr.shapes())
        ]


def project_geom(geom, statefp):
    p = make_projector(statefp)
    return transform(lambda x, y, z=None: p(x, y), geom)


def largest_centroid(geom):
    if isinstance(geom, MultiPolygon):
        geom = max(geom.geoms, key=lambda g: g.area)
    c = geom.centroid
    return round(c.x, 1), round(c.y, 1)


def simplify(geom, tol):
    g = geom.simplify(tol, preserve_topology=True)
    return g


def round_coords(obj, nd=1):
    if isinstance(obj, (list, tuple)):
        return [round_coords(o, nd) for o in obj]
    return round(obj, nd)


def feature(props, geom):
    gi = mapping(geom)
    return {
        "type": "Feature",
        "properties": props,
        "geometry": {"type": gi["type"], "coordinates": round_coords(gi["coordinates"])},
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=str(Path(__file__).parent / ".cache"))
    cache = Path(ap.parse_args().cache)

    states = {}
    for rec, geom in load("state", cache):
        if int(rec["STATEFP"]) > KEEP_MAX_STATEFP:
            continue
        states[rec["STATEFP"]] = (rec, geom)
    abbr = {fp: rec["STUSPS"] for fp, (rec, _) in states.items()}
    for fp, (_, _, (left, top)) in INSETS.items():
        minx, _, _, maxy = project_geom(states[fp][1], fp).bounds
        OFFSETS[fp] = (left - minx, top - maxy)

    county_feats, ref_rows = [], []
    for rec, geom in sorted(load("county", cache), key=lambda t: t[0]["GEOID"]):
        fp = rec["STATEFP"]
        if fp not in abbr:
            continue
        lon, lat = geom.centroid.x, geom.centroid.y
        pg = simplify(project_geom(geom, fp), 0.6)
        cx, cy = largest_centroid(pg)
        county_feats.append(
            feature(
                {"id": rec["GEOID"], "name": rec["NAME"], "abbr": abbr[fp], "cx": cx, "cy": cy},
                pg,
            )
        )
        ref_rows.append(
            [rec["GEOID"], rec["NAME"], abbr[fp], round(lat, 5), round(lon, 5), rec["ALAND"]]
        )

    state_feats = []
    for fp, (rec, geom) in sorted(states.items()):
        pg = simplify(project_geom(geom, fp), 0.6)
        cx, cy = largest_centroid(pg)
        state_feats.append(
            feature(
                {"id": fp, "abbr": rec["STUSPS"], "name": rec["NAME"], "cx": cx, "cy": cy}, pg
            )
        )

    out = ROOT / "frontend" / "public" / "geo"
    out.mkdir(parents=True, exist_ok=True)
    for name, feats in (("us_county", county_feats), ("us_state", state_feats)):
        with open(out / f"{name}.geojson", "w") as f:
            json.dump({"type": "FeatureCollection", "features": feats}, f, separators=(",", ":"))
    ref = ROOT / "sample" / "geo" / "ref"
    ref.mkdir(parents=True, exist_ok=True)
    with open(ref / "county_ref.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["county_fips", "county_name", "state", "lat", "lon", "aland"])
        w.writerows(ref_rows)
    print(f"{len(county_feats)} counties, {len(state_feats)} states")


if __name__ == "__main__":
    main()
