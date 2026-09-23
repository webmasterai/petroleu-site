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

# Targeted pk/en-PK home stats cleanup (exactly 4) — does not overwrite whole storage.
STATS_MARKER="$BACKUP_ROOT/.cleanup-pk-home-stats-4-done"
if [ "${CMS_CLEANUP_PK_STATS_4}" = "true" ]; then
  if [ -f "$STATS_MARKER" ] && [ "${CMS_CLEANUP_PK_STATS_4_FORCE}" != "true" ]; then
    echo "PK stats-4 cleanup already applied ($STATS_MARKER) — skip"
  elif [ -f /app/scripts/cleanup-pk-home-stats-4.mjs ]; then
    echo "Running targeted pk/en-PK home stats cleanup → exactly 4"
    CMS_DATA_DIR="$DATA_DIR" CMS_BACKUP_ROOT="$BACKUP_ROOT" \
      node /app/scripts/cleanup-pk-home-stats-4.mjs
    date -u +"%Y-%m-%dT%H:%M:%SZ" > "$STATS_MARKER"
    echo "PK stats-4 cleanup complete; unset CMS_CLEANUP_PK_STATS_4 after this deploy"
  else
    echo "WARNING: cleanup-pk-home-stats-4.mjs missing"
  fi
fi

# Targeted pk/en-PK header nav cleanup (dedupe About/Contact etc.)
NAV_MARKER="$BACKUP_ROOT/.cleanup-pk-header-nav-done"
if [ "${CMS_CLEANUP_PK_HEADER_NAV}" = "true" ]; then
  if [ -f "$NAV_MARKER" ] && [ "${CMS_CLEANUP_PK_HEADER_NAV_FORCE}" != "true" ]; then
    echo "PK header-nav cleanup already applied ($NAV_MARKER) — skip"
  elif [ -f /app/scripts/cleanup-pk-header-nav.mjs ]; then
    echo "Running targeted pk/en-PK header navigation cleanup"
    CMS_DATA_DIR="$DATA_DIR" CMS_BACKUP_ROOT="$BACKUP_ROOT" \
      node /app/scripts/cleanup-pk-header-nav.mjs
    date -u +"%Y-%m-%dT%H:%M:%SZ" > "$NAV_MARKER"
    echo "PK header-nav cleanup complete; unset CMS_CLEANUP_PK_HEADER_NAV after this deploy"
  else
    echo "WARNING: cleanup-pk-header-nav.mjs missing"
  fi
fi

exec "$@"
