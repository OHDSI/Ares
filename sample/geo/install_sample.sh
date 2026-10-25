#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
data="$root/frontend/public/data"

if [ ! -d "$data" ]; then
  unzip -q "$root/sample/frontend/data.zip" -d "$root/frontend/public"
fi
dest="$data/Synthea/20241021/geo"
rm -rf "$dest"
mkdir -p "$dest"
cp "$here"/data/geo/* "$dest"/
echo "installed geo sample to $dest"
