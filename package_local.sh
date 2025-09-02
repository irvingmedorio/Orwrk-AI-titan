#!/usr/bin/env bash
set -euo pipefail

python -m py_compile $(find backend -name "*.py")
npm run build >/dev/null

TAR_NAME="onwrk-ai-titan-local.tar.gz"
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

tar --exclude='node_modules' --exclude='.git' --exclude="$TAR_NAME" -czf "$TAR_NAME" .

echo "Created $TAR_NAME"
