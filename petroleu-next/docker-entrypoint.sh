#!/bin/sh
set -e
# Seed JSON when data dir is empty, or when CMS_FORCE_RESEED=true (never overwrite users.json).
DATA_DIR="${CMS_DATA_DIR:-/app/storage/data}"
SEED_DIR="/app/storage-seed"
mkdir -p "$DATA_DIR" "${CMS_UPLOAD_DIR:-/app/storage/uploads}"
count=$(find "$DATA_DIR" -maxdepth 1 -name '*.json' 2>/dev/null | wc -l | tr -d ' ')
if [ -d "$SEED_DIR" ]; then
  if [ "$count" = "0" ]; then
    echo "Seeding CMS JSON into $DATA_DIR"
    cp "$SEED_DIR"/*.json "$DATA_DIR"/
  elif [ "${CMS_FORCE_RESEED}" = "true" ]; then
    echo "Force reseeding CMS JSON (keeping users.json)"
    for f in "$SEED_DIR"/*.json; do
      base=$(basename "$f")
      if [ "$base" = "users.json" ]; then
        continue
      fi
      cp "$f" "$DATA_DIR"/
    done
  else
    echo "CMS data present ($count json files) — skip seed"
  fi
fi
exec "$@"
