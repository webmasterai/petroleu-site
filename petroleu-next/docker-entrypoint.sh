#!/bin/sh
set -e
# Seed JSON only when /app/storage/data has no .json files (never overwrite).
DATA_DIR="${CMS_DATA_DIR:-/app/storage/data}"
SEED_DIR="/app/storage-seed"
mkdir -p "$DATA_DIR" "${CMS_UPLOAD_DIR:-/app/storage/uploads}"
count=$(find "$DATA_DIR" -maxdepth 1 -name '*.json' 2>/dev/null | wc -l | tr -d ' ')
if [ "$count" = "0" ] && [ -d "$SEED_DIR" ]; then
  echo "Seeding CMS JSON into $DATA_DIR"
  cp "$SEED_DIR"/*.json "$DATA_DIR"/
else
  echo "CMS data present ($count json files) — skip seed"
fi
exec "$@"
