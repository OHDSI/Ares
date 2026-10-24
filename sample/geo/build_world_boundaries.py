"""Builds frontend/public/geo/world_country.geojson, the country boundaries ARES uses when a
release's region ids follow ISO 3166-1 alpha-2 (regionIdScheme "iso3166_1").

Source: Natural Earth 1:50m admin-0 countries (public domain), plain longitude/latitude.
properties: id (ISO 3166-1 alpha-2), iso3, name, cx, cy (label/bubble position of the largest part)

Usage: python build_world_boundaries.py [--cache DIR]
"""
import argparse
import io
import json
import urllib.request
import zipfile
from pathlib import Path

import shapefile  # pyshp
from shapely.geometry import MultiPolygon, mapping, shape

URL = "https://naciscdn.org/naturalearth/50m/cultural/ne_50m_admin_0_countries.zip"
ROOT = Path(__file__).resolve().parents[2]


def rounded(obj, nd=2):
    if isinstance(obj, (list, tuple)):
        return [rounded(o, nd) for o in obj]
    return round(obj, nd)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=str(Path(__file__).parent / ".cache"))
    cache = Path(ap.parse_args().cache)
    cache.mkdir(parents=True, exist_ok=True)
    z = cache / "ne_50m_admin_0_countries.zip"
    if not z.exists():
        urllib.request.urlretrieve(URL, z)
    with zipfile.ZipFile(z) as zf:
        n = {x.rsplit(".", 1)[-1]: x for x in zf.namelist() if x.endswith((".shp", ".dbf", ".shx"))}
        r = shapefile.Reader(
            shp=io.BytesIO(zf.read(n["shp"])), dbf=io.BytesIO(zf.read(n["dbf"])), shx=io.BytesIO(zf.read(n["shx"]))
        )
        feats = []
        for rec, sh in zip(r.records(), r.shapes()):
            # ISO_A2 is -99 for a few countries (France, Norway, ...); the _EH column repairs them
            iso2, iso3 = rec["ISO_A2_EH"], rec["ISO_A3_EH"]
            if iso2 in ("-99", "", None) or rec["NAME"] == "Antarctica":
                continue
            g = shape(sh.__geo_interface__)
            main_part = max(g.geoms, key=lambda p: p.area) if isinstance(g, MultiPolygon) else g
            c = main_part.representative_point()
            g = g.simplify(0.03, preserve_topology=True)
            if g.is_empty:
                continue
            gi = mapping(g)
            feats.append(
                {
                    "type": "Feature",
                    "properties": {
                        "id": iso2, "iso3": iso3, "name": rec["NAME"],
                        "cx": round(c.x, 2), "cy": round(c.y, 2),
                    },
                    "geometry": {"type": gi["type"], "coordinates": rounded(gi["coordinates"])},
                }
            )
    feats.sort(key=lambda f: f["properties"]["id"])
    out = ROOT / "frontend" / "public" / "geo" / "world_country.geojson"
    out.write_text(json.dumps({"type": "FeatureCollection", "features": feats}, separators=(",", ":")))
    print(f"{len(feats)} countries, {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
