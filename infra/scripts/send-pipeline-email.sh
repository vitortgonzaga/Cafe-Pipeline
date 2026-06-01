#!/usr/bin/env bash
set -euo pipefail

: "${NOTIFICATION_EMAIL:?NOTIFICATION_EMAIL environment variable is required}"
: "${SMTP_HOST:?SMTP_HOST environment variable is required}"
: "${SMTP_USER:?SMTP_USER environment variable is required}"
: "${SMTP_PASS:?SMTP_PASS environment variable is required}"

SMTP_PORT="${SMTP_PORT:-587}"
SMTP_FROM="${SMTP_FROM:-${SMTP_USER}}"
PIPELINE_STATUS="${PIPELINE_STATUS:-${BUILD_RESULT:-UNKNOWN}}"
PIPELINE_JOB="${PIPELINE_JOB:-${JOB_NAME:-unknown-job}}"
PIPELINE_BUILD="${PIPELINE_BUILD:-${BUILD_NUMBER:-0}}"
PIPELINE_URL="${PIPELINE_URL:-${BUILD_URL:-N/A}}"

# Port 465 uses implicit TLS (smtps://). Port 587 uses STARTTLS (smtp:// + --ssl-reqd).
if [[ "${SMTP_SSL:-}" == "true" ]] || [[ "${SMTP_PORT}" == "465" ]]; then
  SMTP_URL="smtps://${SMTP_HOST}:${SMTP_PORT}"
  CURL_TLS_ARGS=()
else
  SMTP_URL="smtp://${SMTP_HOST}:${SMTP_PORT}"
  CURL_TLS_ARGS=(--ssl-reqd)
fi

CURL_VERBOSE=()
if [[ "${SMTP_DEBUG:-}" == "true" ]]; then
  CURL_VERBOSE=(-v)
fi

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

curl "${CURL_VERBOSE[@]}" --silent --show-error \
  "${CURL_TLS_ARGS[@]}" \
  --connect-timeout 30 \
  --max-time 120 \
  --url "${SMTP_URL}" \
  --user "${SMTP_USER}:${SMTP_PASS}" \
  --mail-from "${SMTP_FROM}" \
  --mail-rcpt "${NOTIFICATION_EMAIL}" \
  --upload-file "${mail_file}"

echo "Notification sent to ${NOTIFICATION_EMAIL}"
