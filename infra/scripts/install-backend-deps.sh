#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="${WORKSPACE:-$(pwd)}"

# shellcheck source=/dev/null
. "${WORKSPACE}/.jenkins-env"

cd "${WORKSPACE}/backend"

npm ci
