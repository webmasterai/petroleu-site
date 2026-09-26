# Petroleu Next.js — unified site + JSON CMS (Coolify one-container)
#
# Coolify often injects NODE_ENV=production as a build ARG/ENV into every stage.
# That makes `npm ci` skip devDependencies (typescript, etc.), which breaks Next's
# tsconfig path aliases (@/* → legacy-pages). Force a full install for the build.
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Always install devDependencies so `next build` can resolve @/ path aliases.
RUN npm ci --include=dev

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Public URLs are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:8080
ARG NEXT_PUBLIC_PMS_APP_URL=
ARG NEXT_PUBLIC_DOCUMENTATION_URL=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_PMS_APP_URL=$NEXT_PUBLIC_PMS_APP_URL
ENV NEXT_PUBLIC_DOCUMENTATION_URL=$NEXT_PUBLIC_DOCUMENTATION_URL
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV CMS_DATA_DIR=/app/storage/data
ENV CMS_UPLOAD_DIR=/app/storage/uploads

RUN mkdir -p /app/storage/data /app/storage/uploads

COPY --from=build /app/public ./public
COPY --from=build /app/storage-seed ./storage-seed
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
RUN mkdir -p /app/scripts /app/scripts/fixtures/production-home-media
COPY --from=build /app/scripts/merge-seed-content-additive.mjs /app/scripts/merge-seed-content-additive.mjs
COPY --from=build /app/scripts/cleanup-pk-home-stats-4.mjs /app/scripts/cleanup-pk-home-stats-4.mjs
COPY --from=build /app/scripts/cleanup-pk-header-nav.mjs /app/scripts/cleanup-pk-header-nav.mjs
# CMS media + FAQ migration tooling (version-controlled fixtures; not storage/data)
COPY --from=build /app/scripts/migrate-production-home-media.mjs /app/scripts/migrate-production-home-media.mjs
COPY --from=build /app/scripts/fixtures/production-home-media/ /app/scripts/fixtures/production-home-media/
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
