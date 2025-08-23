#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/deploy-simple.sh user@host /path/to/app

REMOTE="${1:-}"
APP_DIR="${2:-}"

if [ -z "${REMOTE}" ] || [ -z "${APP_DIR}" ]; then
  echo "Usage: $0 user@host /path/to/app"
  exit 1
fi

ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new "${REMOTE}" bash -lc "'
  set -e
  cd "${APP_DIR}"
  export PATH=\"$HOME/.nvm/versions/node/*/bin:$PATH\"
  if command -v dotenv >/dev/null 2>&1; then
    dotenv -e .env -- true || true
  fi
  git pull --ff-only
  npm ci --no-audit --no-fund || npm install --no-audit --no-fund
  node deploy-commands.js || true
  NODE_ENV=production node index.js & disown || true
'"

echo "Deploy commands executed on ${REMOTE}:${APP_DIR}"
