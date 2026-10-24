import argparse
import csv
import math
from datetime import date
from pathlib import Path

import numpy as np

REF = Path(__file__).parent / "ref" / "county_ref.csv"
PERSON_DOMAIN = 1147314  # CDM "Person" domain concept used in location_history.domain_id
# Concept ids come from the OHDSI GIS / SDOH vocabulary (GIS repo, syntheticDataGIS/data/concept.csv).
RESIDENCE = 2052496995  # OMOP GIS "Patient Residence"
TYPE_CONCEPT = 2052499878  # OMOP SDOH "Air Quality Database" (Exposure Type Concept)
RELATIONSHIP = 2052496943  # OMOP GIS "Within" (Geometry Relationship)

# concept_id -> (name, vocabulary_id, concept_class_id, concept_code). Names are verbatim from the
# vocabulary except for the unit glyphs, which are mojibake ("?g/M3") in the source file.
CONCEPTS = {
    2052499839: ("Annual Mean Of Particulate Matter (PM2.5) Concentration (\u00b5g/M3)", "OMOP SDOH", "AHRQ Item", "WUSTL_AVG_PM25"),
    2052499957: ("4th Highest Daily Max 8-Hour Average Of Ozone (O3) In The Year (PPM)", "OMOP SDOH", "AHRQ Item", "EPAA_4THMAX_O3_8HR"),
    2052499841: ("Annual Mean Of All The 1-Hour Measurements Of Nitrogen Dioxide (No2) In The Year (Ppb)", "OMOP SDOH", "AHRQ Item", "EPAA_MEAN_NO2_1HR"),
    2052499837: ("Area Deprivation Index (ADI)", "OMOP SDOH", "ADI Construct", "GIS1000110"),
    2052497879: ("Proportion Of Tract'S Area Within 1-Mi Buffer Of Green Space", "OMOP SDOH", "EJI EBM Item", "E_PARK"),
    2052497544: ("Total Number Of Days With Daily Maximum Heat Index, Absolute Threshold: 90\u00b0F", "OMOP SDOH", "AHRQ Item", "NEPHTN_HEATIND_90"),
    2052499878: ("Air Quality Database", "OMOP SDOH", "Exposure Type Concept", "GIS1000107"),
    2052496943: ("Within", "OMOP GIS", "Geometry Relationship", "GIS1003256"),
    2052496995: ("Patient Residence", "OMOP GIS", "Location", "GIS1003089"),
}

# key -> (concept_id, base, lat_slope, lon_slope, trend/yr, county_sd, person_sd, first_year_offset, county_coverage)
# The GIS vocabulary has no UCUM unit for these, and Gaia leaves unit_concept_id empty, so we do too.
EXPOSURES = {
    "pm25": (2052499839, 9.5, 0.35, 0.05, -0.12, 1.0, 0.4, 0, 1.0),
    "ozone": (2052499957, 0.068, -0.0003, 0.0001, -0.0004, 0.003, 0.0008, 0, 0.6),
    "no2": (2052499841, 11.0, 0.1, 0.12, -0.2, 2.5, 0.6, 0, 1.0),
    "adi": (2052499837, 50.0, -0.5, -0.2, 0.0, 14.0, 0.0, 0, 1.0),
    "greenspace": (2052497879, 0.30, 0.004, -0.003, 0.002, 0.08, 0.01, 3, 1.0),
    "heat": (2052497544, 12.0, -0.3, 0.0, 0.5, 4.0, 1.5, 0, 1.0),
}


WORLD_GEOJSON = Path(__file__).resolve().parents[2] / "frontend" / "public" / "geo" / "world_country.geojson"
WORLD_COUNTRIES = (
    "US CA MX BR AR CL CO PE VE GB IE FR DE ES PT IT NL BE CH AT SE NO DK FI PL CZ HU RO GR TR UA RU "
    "EG NG KE ZA ET GH MA DZ SA IR IQ IL AE PK IN BD CN JP KR TH VN ID PH MY AU NZ"
).split()


def load_countries(skip=()):
    import json

    feats = {f["properties"]["id"]: f["properties"] for f in json.load(open(WORLD_GEOJSON))["features"]}
    return [
        {"county_fips": "", "county_name": feats[c]["name"], "state": "", "country": c,
         "lat": feats[c]["cy"], "lon": feats[c]["cx"], "aland": "30000000000"}
        for c in WORLD_COUNTRIES if c in feats and c not in skip
    ]


def load_counties(states, per_state):
    with open(REF) as f:
        rows = [r for r in csv.DictReader(f) if r["state"] in states]
    out = []
    for st in states:
        sub = sorted((r for r in rows if r["state"] == st), key=lambda r: -int(r["aland"]))
        out.extend(sub[:per_state] if per_state else sub)
    for r in out:
        r["country"] = "US"
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--mini", action="store_true")
    ap.add_argument("--world", action="store_true")
    ap.add_argument("--persons", type=int)
    a = ap.parse_args()

    if a.world:
        states, per_state, persons = [], 0, a.persons or 30000
        years, exps = range(2015, 2024), list(EXPOSURES)
    elif a.mini:
        states, per_state, persons = ["MI", "OH"], 4, a.persons or 400
        years, exps = range(2019, 2022), ["pm25", "ozone", "heat"]
    else:
        states, per_state, persons = ["MI", "OH", "IN", "IL", "WI"], 0, a.persons or 30000
        years, exps = range(2015, 2024), list(EXPOSURES)
    rng = np.random.default_rng(a.seed)
    if a.world:
        counties = load_countries()
    else:
        counties = load_counties(states, per_state)
        if not a.mini:
            counties += load_countries(skip=("US",))
    nc = len(counties)
    lat = np.array([float(c["lat"]) for c in counties])
    lon = np.array([float(c["lon"]) for c in counties])
    aland = np.array([float(c["aland"]) for c in counties])

    # pseudo population weight: weak area dependence times a heavy-tailed county factor
    w = aland**0.3 * rng.lognormal(0, 1.0, nc)
    if a.mini:
        w[-1] = w.min() * 0.02  # one county that falls below any sensible suppression threshold
    w /= w.sum()

    # county-level random effects, one per exposure
    ceff = {k: rng.normal(0, 1, nc) for k in exps}
    covered = {k: rng.random(nc) < EXPOSURES[k][-1] for k in exps}

    y0, y1 = years[0], years[-1]
    home = rng.choice(nc, persons, p=w)
    moves = rng.random(persons) < 0.12
    move_year = rng.integers(y0 + 1, y1 + 1, persons) if y1 > y0 else np.full(persons, y0)
    move_date = [date(int(y), int(m), 1) for y, m in zip(move_year, rng.integers(2, 12, persons))]
    dest = rng.choice(nc, persons, p=w)
    has_history = rng.random(persons) > 0.04

    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)

    locations, history, exposures = [], [], []
    loc_id = 0

    def new_location(ci, pid):
        nonlocal loc_id
        loc_id += 1
        c = counties[ci]
        unknown_county = rng.random() < 0.01
        locations.append(
            [
                loc_id, c["state"], c["county_name"], f"{rng.integers(0, 99999):05d}",
                round(float(lat[ci] + rng.normal(0, 0.08)), 5),
                round(float(lon[ci] + rng.normal(0, 0.08)), 5),
                f"SAMPLE-{loc_id:06d}", "" if unknown_county else c["county_fips"], c["country"],
            ]
        )
        return loc_id

    world = a.world

    def value(k, ci, year):
        _, base, bl, bo, tr, csd, psd, *_ = EXPOSURES[k]
        v = (
            base
            + bl * (lat[ci] - (30.0 if world else 42.0)) * (0.4 if world else 1.0)
            + bo * (lon[ci] - (0.0 if world else -85.0)) * (0.2 if world else 1.0)
            + tr * (year - y0)
            + csd * ceff[k][ci]
            + rng.normal(0, psd)
        )
        if k == "adi":
            v = min(100.0, max(1.0, v))
        elif k == "greenspace":
            v = min(1.0, max(0.0, v))
        elif k == "heat":
            v = max(0.0, v)
        else:
            v = max(0.0001, v)
        return round(float(v), 4)

    ee_id = 0
    for pid in range(1, persons + 1):
        i = pid - 1
        stays = [(home[i], date(y0, 1, 1), date(y1, 12, 31))]
        if moves[i] and dest[i] != home[i]:
            stays = [
                (home[i], date(y0, 1, 1), move_date[i]),
                (dest[i], move_date[i], date(y1, 12, 31)),
            ]
        for ci, s, e in stays:
            lid = new_location(int(ci), pid)
            if has_history[i]:
                history.append([lid, RESIDENCE, PERSON_DOMAIN, pid, s.isoformat(), e.isoformat()])
            for k in exps:
                cid, *_, first_year, _ = EXPOSURES[k]
                if not covered[k][ci]:
                    continue
                for y in years:
                    if y - y0 < first_year:
                        continue
                    ys, ye = date(y, 1, 1), date(y, 12, 31)
                    rs, re_ = max(s, ys), min(e, ye)
                    if rs > re_:
                        continue
                    ee_id += 1
                    exposures.append(
                        [ee_id, lid, pid, cid, rs.isoformat(), re_.isoformat(), TYPE_CONCEPT,
                         RELATIONSHIP, "", "", "", "", value(k, int(ci), y), "", ""]
                    )

    def write(name, header, rows):
        with open(out / name, "w", newline="") as f:
            w_ = csv.writer(f)
            w_.writerow(header)
            w_.writerows(rows)

    write("location.csv",
          ["location_id", "state", "county", "zip", "latitude", "longitude", "location_source_value", "county_fips", "country_source_value"],
          locations)
    write("location_history.csv",
          ["location_id", "relationship_type_concept_id", "domain_id", "entity_id", "start_date", "end_date"],
          history)
    write("external_exposure.csv",
          ["external_exposure_id", "location_id", "person_id", "exposure_concept_id", "exposure_start_date",
           "exposure_end_date", "exposure_type_concept_id", "exposure_relationship_concept_id",
           "exposure_source_concept_id", "exposure_source_value", "exposure_relationship_source_value",
           "dose_unit_source_value", "value_as_number", "value_as_concept_id", "unit_concept_id"],
          exposures)
    used = {EXPOSURES[k][0] for k in exps} | {TYPE_CONCEPT, RELATIONSHIP, RESIDENCE}
    concepts = [
        [cid, CONCEPTS[cid][0], "Observation", CONCEPTS[cid][1], CONCEPTS[cid][2], "S", CONCEPTS[cid][3]]
        for cid in sorted(used)
    ]
    write("concept.csv",
          ["concept_id", "concept_name", "domain_id", "vocabulary_id", "concept_class_id", "standard_concept",
           "concept_code"], concepts)
    write("cdm_source.csv",
          ["cdm_source_name", "cdm_source_abbreviation", "cdm_holder", "source_description",
           "source_documentation_reference", "cdm_etl_reference", "source_release_date", "cdm_release_date",
           "cdm_version", "cdm_version_concept_id", "vocabulary_version"],
          [["Synthetic Geo Sample", "GeoSample", "ARES", "Synthetic data for geographic exposures", "", "",
            "2024-10-21", "2024-10-21", "5.4", 756265, "sample"]])
    print(f"{persons} persons, {len(locations)} locations, {len(history)} history rows, "
          f"{len(exposures)} exposure rows -> {out}")


if __name__ == "__main__":
    main()
