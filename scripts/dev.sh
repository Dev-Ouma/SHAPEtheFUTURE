#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_PORT="${BACKEND_PORT:-3001}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

kill_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti :"$port" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "Stopping stale process(es) on port $port: $pids"
    kill -9 $pids 2>/dev/null || true
    sleep 1
  fi
}

echo "Clearing ports $BACKEND_PORT and $FRONTEND_PORT..."
kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"

echo "Starting backend on port $BACKEND_PORT..."
cd "$ROOT/backend"
npm run start:dev &
BACKEND_PID=$!

echo "Waiting for backend..."
for i in {1..60}; do
  if curl -sf "http://127.0.0.1:${BACKEND_PORT}/maintenance/status" >/dev/null 2>&1; then
    echo "Backend ready."
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Backend exited before becoming ready."
    exit 1
  fi
  sleep 2
done

echo "Starting frontend on port $FRONTEND_PORT..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

cleanup() {
  echo
  echo "Stopping dev servers..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Dev stack running:"
echo "  Frontend: http://localhost:${FRONTEND_PORT}"
echo "  Backend:  http://127.0.0.1:${BACKEND_PORT}"
echo "  Admin:    http://localhost:${FRONTEND_PORT}/admin/login"
echo "Press Ctrl+C to stop both."

wait
