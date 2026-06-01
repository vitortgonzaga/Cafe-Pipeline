#!/usr/bin/env bash
set -euo pipefail

NODE_VERSION="${NODE_VERSION:-20.19.0}"
NODE_DIR="${HOME}/.local/node"
WORKSPACE="${WORKSPACE:-$(pwd)}"

install_node() {
  if [[ -x "${NODE_DIR}/bin/node" ]]; then
    return 0
  fi

  mkdir -p "${NODE_DIR}"

  local arch
  arch="$(uname -m)"
  case "${arch}" in
    x86_64) local node_arch="x64" ;;
    aarch64 | arm64) local node_arch="arm64" ;;
    *)
      echo "Unsupported architecture: ${arch}" >&2
      exit 1
      ;;
  esac

  local archive="node-v${NODE_VERSION}-linux-${node_arch}.tar.gz"
  curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/${archive}" \
    | tar -xz -C "${NODE_DIR}" --strip-components=1
}

install_curl() {
  if command -v curl >/dev/null 2>&1; then
    return 0
  fi

  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y curl
    return 0
  fi

  echo "curl is required but could not be installed automatically." >&2
  exit 1
}

install_curl
install_node

cat > "${WORKSPACE}/.jenkins-env" <<EOF
export PATH="${NODE_DIR}/bin:\${PATH}"
export NODE_DIR="${NODE_DIR}"
EOF

echo "Node.js $( "${NODE_DIR}/bin/node" -v )"
echo "npm $( "${NODE_DIR}/bin/npm" -v )"
