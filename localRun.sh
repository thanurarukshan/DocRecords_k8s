#!/bin/bash

# ═══════════════════════════════════════════════════════════════
#  DocRecords — Local Development Runner
#  Starts all microservices locally using npm run dev
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║       🏥 DocRecords — Local Dev Runner        ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── Step 1: Check prerequisites ────────────────────────────
echo -e "${YELLOW}[1/4] Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js is not installed. Please install Node.js first.${NC}"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm is not installed. Please install npm first.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) and npm $(npm -v) found${NC}"

# ─── Step 2: Install dependencies ───────────────────────────
echo -e "${YELLOW}[2/4] Installing dependencies...${NC}"

SERVICES=(
  "backend/auth-service"
  "backend/patient-service"
  "backend/prescription-service"
  "backend/profile-control-service"
  "backend/api-gateway"
  "frontend"
)

for service in "${SERVICES[@]}"; do
  service_dir="$PROJECT_ROOT/$service"
  if [ -d "$service_dir" ]; then
    if [ ! -d "$service_dir/node_modules" ]; then
      echo -e "  📦 Installing deps for ${CYAN}$service${NC}..."
      (cd "$service_dir" && npm install --silent) || {
        echo -e "${RED}  ✗ Failed to install deps for $service${NC}"
        exit 1
      }
    else
      echo -e "  ${GREEN}✓${NC} $service — node_modules exists"
    fi
  else
    echo -e "  ${RED}✗ Directory not found: $service${NC}"
  fi
done

# ─── Step 3: Set local environment variables ────────────────
echo -e "${YELLOW}[3/4] Configuring local environment...${NC}"

# Override DB_HOST for local development (all services use .env with mysql-db)
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=Hello_there123
export DB_PORT=3306
export JWT_SECRET=supersecretkey

echo -e "  ${GREEN}✓${NC} DB_HOST=localhost, DB_PORT=3306"

# ─── Step 4: Start all services ─────────────────────────────
echo -e "${YELLOW}[4/4] Starting all services...${NC}"

PIDS=()

cleanup() {
  echo ""
  echo -e "${YELLOW}Stopping all services...${NC}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null
  done
  wait 2>/dev/null
  echo -e "${GREEN}All services stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend services
start_service() {
  local dir="$1"
  local name="$2"
  local service_dir="$PROJECT_ROOT/$dir"

  if [ -d "$service_dir" ]; then
    echo -e "  🚀 Starting ${CYAN}$name${NC}..."
    (cd "$service_dir" && npm run dev 2>&1 | sed "s/^/  [$name] /") &
    PIDS+=($!)
  fi
}

# Auth service needs auth_db
(cd "$PROJECT_ROOT/backend/auth-service" && DB_NAME=auth_db npm run dev 2>&1 | sed "s/^/  [auth-service] /") &
PIDS+=($!)
echo -e "  🚀 Starting ${CYAN}auth-service${NC} (auth_db)..."

# Patient service uses auth_db
(cd "$PROJECT_ROOT/backend/patient-service" && DB_NAME=auth_db npm run dev 2>&1 | sed "s/^/  [patient-service] /") &
PIDS+=($!)
echo -e "  🚀 Starting ${CYAN}patient-service${NC} (auth_db)..."

# Prescription service uses patient_db
(cd "$PROJECT_ROOT/backend/prescription-service" && DB_NAME=patient_db npm run dev 2>&1 | sed "s/^/  [prescription-service] /") &
PIDS+=($!)
echo -e "  🚀 Starting ${CYAN}prescription-service${NC} (patient_db)..."

# Profile control service uses auth_db
(cd "$PROJECT_ROOT/backend/profile-control-service" && DB_NAME=auth_db npm run dev 2>&1 | sed "s/^/  [profile-control-service] /") &
PIDS+=($!)
echo -e "  🚀 Starting ${CYAN}profile-control-service${NC} (auth_db)..."

# API Gateway (no DB needed, defaults to localhost targets)
(cd "$PROJECT_ROOT/backend/api-gateway" && npm run dev 2>&1 | sed "s/^/  [api-gateway] /") &
PIDS+=($!)
echo -e "  🚀 Starting ${CYAN}api-gateway${NC}..."

# Frontend
(cd "$PROJECT_ROOT/frontend" && npm run dev 2>&1 | sed "s/^/  [frontend] /") &
PIDS+=($!)
echo -e "  🚀 Starting ${CYAN}frontend${NC}..."

# Give services a moment to start
sleep 3

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         All services are starting up!         ║${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Frontend:     http://localhost:5173           ║${NC}"
echo -e "${GREEN}║  API Gateway:  http://localhost:4000           ║${NC}"
echo -e "${GREEN}║  Auth:         http://localhost:5001           ║${NC}"
echo -e "${GREEN}║  Patient:      http://localhost:5000           ║${NC}"
echo -e "${GREEN}║  Prescription: http://localhost:5004           ║${NC}"
echo -e "${GREEN}║  Profile:      http://localhost:5008           ║${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Press Ctrl+C to stop all services            ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# Wait for all background processes
wait
