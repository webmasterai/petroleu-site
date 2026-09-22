#!/bin/sh
set -e
# Seed JSON when data dir is empty, or when CMS_FORCE_RESEED=true (never overwrite users.json).
# Optional ONE-SHOT additive merge from storage-seed (never replaces existing rows; never touches users/inquiries).
DATA_DIR="${CMS_DATA_DIR:-/app/storage/data}"
SEED_DIR="${CMS_SEED_DIR:-/app/storage-seed}"
UPLOAD_DIR="${CMS_UPLOAD_DIR:-/app/storage/uploads}"
BACKUP_ROOT="${CMS_BACKUP_ROOT:-/app/storage/backups}"
MARKER_FILE="$BACKUP_ROOT/.merge-seed-additive-done"

mkdir -p "$DATA_DIR" "$UPLOAD_DIR" "$BACKUP_ROOT"
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
      if [ "$base" = "inquiries.json" ]; then
        continue
      fi
      cp "$f" "$DATA_DIR"/
    done
  else
    echo "CMS data present ($count json files) — skip full seed"
  fi
fi

# Additive merge: insert missing content records from seed without overwriting production rows.
if [ "${CMS_MERGE_SEED_ADDITIVE}" = "true" ]; then
  if [ -f "$MARKER_FILE" ] && [ "${CMS_MERGE_SEED_ADDITIVE_FORCE}" != "true" ]; then
    echo "CMS additive merge already applied ($MARKER_FILE) — skip"
  elif [ -f /app/scripts/merge-seed-content-additive.mjs ]; then
    echo "Running safe additive CMS content merge from $SEED_DIR → $DATA_DIR"
    CMS_DATA_DIR="$DATA_DIR" CMS_SEED_DIR="$SEED_DIR" CMS_BACKUP_ROOT="$BACKUP_ROOT" \
      node /app/scripts/merge-seed-content-additive.mjs
    date -u +"%Y-%m-%dT%H:%M:%SZ" > "$MARKER_FILE"
    echo "Additive merge complete; marker written to $MARKER_FILE"
    echo "IMPORTANT: unset CMS_MERGE_SEED_ADDITIVE after this deploy"
  else
    echo "WARNING: merge script missing at /app/scripts/merge-seed-content-additive.mjs"
  fi
fi

exec "$@"
