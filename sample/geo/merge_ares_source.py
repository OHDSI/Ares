import argparse
import json
import shutil
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True, help="target ARES data folder (has index.json)")
    ap.add_argument("--add", required=True, help="ARES data folder to merge in (has index.json)")
    a = ap.parse_args()
    data, add = Path(a.data), Path(a.add)

    target = json.loads((data / "index.json").read_text())
    incoming = json.loads((add / "index.json").read_text())
    keys = {s["cdm_source_key"] for s in incoming["sources"]}
    for key in keys:
        if (data / key).exists():
            shutil.rmtree(data / key)
        shutil.copytree(add / key, data / key)
    target["sources"] = [s for s in target["sources"] if s["cdm_source_key"] not in keys] + incoming["sources"]
    (data / "index.json").write_text(json.dumps(target))
    print(f"merged {', '.join(sorted(keys))} into {data / 'index.json'}")


if __name__ == "__main__":
    main()
