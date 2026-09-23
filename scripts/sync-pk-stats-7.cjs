/**
 * DEPRECATED — the canonical homepage stats set is now 4 items.
 * Use: node scripts/sync-pk-stats-4.cjs
 * Production: node petroleu-next/scripts/cleanup-pk-home-stats-4.mjs
 *
 * This stub exits with an error so the old 7-stat flow cannot silently reintroduce
 * 1350+ / 20+ / 4.8 into CMS data.
 */
console.error(
  'sync-pk-stats-7.cjs is retired. Run node scripts/sync-pk-stats-4.cjs instead (exact 4 homepage stats).',
)
process.exit(1)
