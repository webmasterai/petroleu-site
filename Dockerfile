# Marketing website frontend only (React + Vite → nginx)
# CMS Laravel is a separate Coolify resource — not included in this image.
#
# Build (Coolify build-arg required):
#   VITE_CMS_API_BASE_URL=https://<CMS-BACKEND-DOMAIN>/api/cms

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js eslint.config.js ./
COPY public ./public
COPY src ./src

# CMS API base — bake at build time. No hardcoded production domain.
ARG VITE_CMS_API_BASE_URL
ENV VITE_CMS_API_BASE_URL=$VITE_CMS_API_BASE_URL

RUN if [ -z "$VITE_CMS_API_BASE_URL" ]; then \
      echo "ERROR: VITE_CMS_API_BASE_URL build-arg is required (e.g. https://<CMS-BACKEND-DOMAIN>/api/cms)"; \
      exit 1; \
    fi \
 && case "$VITE_CMS_API_BASE_URL" in \
      http://*|https://*) ;; \
      *) echo "ERROR: VITE_CMS_API_BASE_URL must be an absolute http(s) URL"; exit 1 ;; \
    esac \
 && npm run build

# ---- production ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
