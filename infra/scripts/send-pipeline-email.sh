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
PIPELINE_BRANCH="${BRANCH_NAME:-${GIT_BRANCH:-N/A}}"
PIPELINE_COMMIT="${GIT_COMMIT:-N/A}"
PIPELINE_DATE="$(date -u '+%Y-%m-%d %H:%M:%S UTC')"

case "${PIPELINE_STATUS}" in
  SUCCESS) STATUS_LABEL="SUCCESS - pipeline completed successfully" ;;
  FAILURE) STATUS_LABEL="FAILURE - action required" ;;
  UNSTABLE) STATUS_LABEL="UNSTABLE - review test results" ;;
  ABORTED) STATUS_LABEL="ABORTED - execution interrupted" ;;
  *) STATUS_LABEL="${PIPELINE_STATUS}" ;;
esac

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

subject="[Cafe Pipeline] ${PIPELINE_JOB} #${PIPELINE_BUILD} - ${PIPELINE_STATUS}"
body=$(cat <<EOF
Cafe Pipeline CI/CD Report
==========================

Status
------
${STATUS_LABEL}

Execution
---------
Job:      ${PIPELINE_JOB}
Build:    #${PIPELINE_BUILD}
Date:     ${PIPELINE_DATE}
Branch:   ${PIPELINE_BRANCH}
Commit:   ${PIPELINE_COMMIT}

Generated artifacts
-------------------
- artifacts/frontend-package.tar.gz
- artifacts/backend-package.tar.gz
- frontend/coverage/
- backend/coverage/
- frontend/html/
- backend/test-results/

Pipeline stages
---------------
- Checkout
- Setup Jenkins dependencies
- Install frontend and backend dependencies
- Typecheck frontend and backend
- Run coverage tests
- Build and package artifacts

This message was generated automatically by Jenkins.
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
