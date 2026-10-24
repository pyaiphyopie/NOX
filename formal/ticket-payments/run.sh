#!/usr/bin/env bash
# Run the TicketPayments model check with pinned TLC 1.7.4.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
TOOLS="$ROOT/tools"
JAR="$TOOLS/tla2tools.jar"
JAVA_BIN="${JAVA:-java}"
mkdir -p "$TOOLS"
if [[ ! -f "$JAR" ]]; then
  echo "Downloading TLC 1.7.4 (tla2tools.jar)…"
  curl -fsSL -o "$JAR" \
    "https://github.com/tlaplus/tlaplus/releases/download/v1.7.4/tla2tools.jar"
  echo "936a262061c914694dfd669a543be24573c45d5aa0ff20a8b96b23d01e050e88  $JAR" \
    | sha256sum -c -
fi
cd "$ROOT"
# Workers=2, and a modest state bound keeps agent reruns under ~30s.
exec "$JAVA_BIN" -XX:+UseParallelGC -cp "$JAR" tlc2.TLC \
  -config TicketPayments.cfg \
  -workers 2 \
  -maxSetSize 1000000 \
  TicketPayments.tla
