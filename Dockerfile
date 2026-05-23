# ---- Stage 1: Build ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first for layer caching
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts \
 && cp -R node_modules node_modules_prod \
 && npm ci

COPY . .

RUN npm run build

# ---- Stage 2: Production ----
FROM nginx:1.27-alpine AS production

# Security: run as non-root
RUN addgroup -g 1001 -S nox && \
    adduser -u 1001 -S nox -G nox && \
    chown -R nox:nox /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

COPY --from=builder /app/dist /usr/share/nginx/html

# Production nginx config with security headers and gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

USER nox

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
