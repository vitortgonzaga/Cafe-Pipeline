#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="${WORKSPACE:-$(pwd)}"

# shellcheck source=/dev/null
. "${WORKSPACE}/.jenkins-env"

cd "${WORKSPACE}/frontend"

npm ci --include=optional

# package-lock.json was generated on Windows; ensure Linux native binaries exist.
npm install --no-save \
  lightningcss-linux-x64-gnu@1.32.0 \
  @cloudflare/workerd-linux-64@1.20260515.1
