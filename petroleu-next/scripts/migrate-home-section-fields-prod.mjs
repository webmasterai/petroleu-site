/**
 * Production-safe template (DO NOT RUN AUTOMATICALLY).
 * Same logic as populate-home-section-fields.mjs — run manually after backup on prod host.
 *
 *   node scripts/migrate-home-section-fields-prod.mjs --dry-run
 *   node scripts/migrate-home-section-fields-prod.mjs
 */
export { } // marker — implement by copying populate-home-section-fields.mjs when deploying
console.log(
  'Use scripts/populate-home-section-fields.mjs against a backed-up copy of production sections.json. Do not run against live production automatically.',
)
