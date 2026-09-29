#!/usr/bin/env bash
# Refresh the vendored OSS rule pack (rule YAML + fixture examples) that powers
# the public rule catalogue and the generated Semgrep bundles. Run after a rule
# release in the OSS `oauthlint` repo. Source path is overridable:
#   OAUTHLINT_RULES_SRC=/path/to/oauthlint/rules pnpm sync:rules
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WWW="$(cd "$HERE/.." && pwd)"
SRC="${OAUTHLINT_RULES_SRC:-$WWW/../oauthlint/rules}"
if [ ! -d "$SRC/rules" ]; then echo "rules source not found at $SRC/rules (set OAUTHLINT_RULES_SRC)"; exit 1; fi
DEST="$WWW/vendor/oauthlint-rules"
rm -rf "$DEST/rules" "$DEST/tests/fixtures"
mkdir -p "$DEST/tests"
rsync -a --delete "$SRC/rules/" "$DEST/rules/"
rsync -a --delete "$SRC/tests/fixtures/" "$DEST/tests/fixtures/"
echo "synced rules from $SRC -> $DEST"
echo "regenerating Semgrep bundles..."
( cd "$WWW" && pnpm run build:semgrep )
