#!/usr/bin/env bash
set -euo pipefail

: "${NOTIFICATION_EMAIL:?NOTIFICATION_EMAIL environment variable is required}"
: "${SMTP_HOST:?SMTP_HOST environment variable is required}"
: "${SMTP_USER:?SMTP_USER environment variable is required}"
: "${SMTP_PASS:?SMTP_PASS environment variable is required}"

SMTP_PORT="${SMTP_PORT:-587}"
SMTP_FROM="${SMTP_FROM:-jenkins@localhost}"
PIPELINE_STATUS="${PIPELINE_STATUS:-${BUILD_RESULT:-UNKNOWN}}"
PIPELINE_JOB="${PIPELINE_JOB:-${JOB_NAME:-unknown-job}}"
PIPELINE_BUILD="${PIPELINE_BUILD:-${BUILD_NUMBER:-0}}"
PIPELINE_URL="${PIPELINE_URL:-${BUILD_URL:-N/A}}"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required to send notification emails." >&2
  exit 1
fi

subject="Pipeline ${PIPELINE_JOB} #${PIPELINE_BUILD} - ${PIPELINE_STATUS}"
body=$(cat <<EOF
Pipeline execution summary
==========================

Job: ${PIPELINE_JOB}
Build: #${PIPELINE_BUILD}
Status: ${PIPELINE_STATUS}
URL: ${PIPELINE_URL}

Artifacts:
- frontend-package.tar.gz
- coverage report (frontend/coverage)
- test report (frontend/html)
EOF
)

mail_file="$(mktemp)"
trap 'rm -f "${mail_file}"' EXIT

{
  printf 'From: %s\r\n' "${SMTP_FROM}"
  printf 'To: %s\r\n' "${NOTIFICATION_EMAIL}"
  printf 'Subject: %s\r\n' "${subject}"
  printf 'Content-Type: text/plain; charset=UTF-8\r\n'
  printf '\r\n'
  printf '%s\r\n' "${body}"
} > "${mail_file}"

curl --silent --show-error --ssl-reqd \
  --url "smtp://${SMTP_HOST}:${SMTP_PORT}" \
  --user "${SMTP_USER}:${SMTP_PASS}" \
  --mail-from "${SMTP_FROM}" \
  --mail-rcpt "${NOTIFICATION_EMAIL}" \
  --upload-file "${mail_file}"

echo "Notification sent to ${NOTIFICATION_EMAIL}"
