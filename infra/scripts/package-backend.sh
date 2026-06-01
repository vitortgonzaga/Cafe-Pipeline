#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND="${ROOT}/backend"
ARTIFACTS="${ROOT}/artifacts"

mkdir -p "${ARTIFACTS}"

cd "${BACKEND}"

if [[ ! -d "dist" ]]; then
  echo "Build output not found (dist)." >&2
  exit 1
fi

tar -czf "${ARTIFACTS}/backend-package.tar.gz" dist package.json package-lock.json
echo "Created ${ARTIFACTS}/backend-package.tar.gz"
