# Petroleu Next.js — unified site + JSON CMS (Coolify one-container)
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV CMS_DATA_DIR=/app/storage/data
ENV CMS_UPLOAD_DIR=/app/storage/uploads

RUN mkdir -p /app/storage/data /app/storage/uploads \
  && chmod +x /app/docker-entrypoint.sh || true

COPY --from=build /app/public ./public
COPY --from=build /app/storage-seed ./storage-seed
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
