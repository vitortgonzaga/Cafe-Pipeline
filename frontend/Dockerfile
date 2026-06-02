FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN set -euo pipefail; \
  npm ci --include=optional; \
  ARCH="$(dpkg --print-architecture)"; \
  case "${ARCH}" in \
    amd64) \
      LIGHTNINGCSS_PACKAGE="lightningcss-linux-x64-gnu@1.32.0"; \
      WORKERD_PACKAGE="@cloudflare/workerd-linux-64@1.20260515.1"; \
      ;; \
    arm64) \
      LIGHTNINGCSS_PACKAGE="lightningcss-linux-arm64-gnu@1.32.0"; \
      WORKERD_PACKAGE="@cloudflare/workerd-linux-arm64@1.20260515.1"; \
      ;; \
    *) \
      echo "Unsupported architecture for frontend native packages: ${ARCH}" >&2; \
      exit 1; \
      ;; \
  esac; \
  npm install --no-save "${LIGHTNINGCSS_PACKAGE}" "${WORKERD_PACKAGE}"

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
