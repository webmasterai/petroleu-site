#!/bin/sh
set -e

cd /var/www/html

# Never regenerate APP_KEY here — set APP_KEY in Coolify and keep it stable.
if [ -z "${APP_KEY:-}" ]; then
  echo "WARNING: APP_KEY is empty. Set APP_KEY in Coolify before production traffic."
fi

# Public media symlink: public/storage -> storage/app/public
php artisan storage:link || true

# Safe config cache only when key is present (avoids baking empty APP_KEY).
# Skip route:cache — api.php uses a closure for /api/health.
if [ -n "${APP_KEY:-}" ] && [ "${APP_ENV:-}" = "production" ]; then
  php artisan config:cache || true
else
  php artisan config:clear || true
fi

# Do NOT run: migrate --force, db:seed, cms:create-admin on every start.
# Those are one-time / manual Coolify operations.

exec php artisan serve --host=0.0.0.0 --port=8000
