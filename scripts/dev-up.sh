#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/infrastructure/docker"
echo "Starting NOX stack (Redis + Nest services)..."
docker compose up --build -d redis
sleep 2
docker compose up --build -d
echo ""
echo "Services:"
echo "  API Gateway (WS)  : http://localhost:3000"
echo "  Auth              : http://localhost:3001"
echo "  Event             : http://localhost:3002"
echo "  Ticket            : http://localhost:3003"
echo "  Payment           : http://localhost:3004"
echo "  Redis             : localhost:6379"
echo ""
echo "Copy .env.example → .env and set SUPABASE_* + payment keys for full path."
