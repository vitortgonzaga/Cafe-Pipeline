#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="${WORKSPACE:-$(pwd)}"

# shellcheck source=/dev/null
. "${WORKSPACE}/.jenkins-env"

cd "${WORKSPACE}/frontend"

npm ci --include=optional

# package-lock.json was generated on Windows; ensure Linux native binaries exist.
ARCH="$(uname -m)"

case "${ARCH}" in
  x86_64)
    LIGHTNINGCSS_PACKAGE="lightningcss-linux-x64-gnu@1.32.0"
    WORKERD_PACKAGE="@cloudflare/workerd-linux-64@1.20260515.1"
    ;;
  aarch64|arm64)
    LIGHTNINGCSS_PACKAGE="lightningcss-linux-arm64-gnu@1.32.0"
    WORKERD_PACKAGE="@cloudflare/workerd-linux-arm64@1.20260515.1"
    ;;
  *)
    echo "Unsupported architecture for frontend native packages: ${ARCH}" >&2
    exit 1
    ;;
esac

npm install --no-save \
  "${LIGHTNINGCSS_PACKAGE}" \
  "${WORKERD_PACKAGE}"
