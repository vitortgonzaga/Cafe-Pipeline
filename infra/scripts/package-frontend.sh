#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND="${ROOT}/frontend"
ARTIFACTS="${ROOT}/artifacts"

mkdir -p "${ARTIFACTS}"

cd "${FRONTEND}"

package_paths=()
for output_dir in .output dist; do
  if [[ -d "${output_dir}" ]]; then
    package_paths+=("${output_dir}")
  fi
done

if [[ ${#package_paths[@]} -eq 0 ]]; then
  echo "Build output not found (.output or dist)." >&2
  exit 1
fi

tar -czf "${ARTIFACTS}/frontend-package.tar.gz" "${package_paths[@]}"
echo "Created ${ARTIFACTS}/frontend-package.tar.gz"
