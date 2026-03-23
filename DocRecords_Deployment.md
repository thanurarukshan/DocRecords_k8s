# DocRecords — Deployment Guide

> **Project:** DocRecords — A microservices-based medical records management system  
> **Stack:** React (Vite) · Node.js · MySQL 8.0  
> **Last Updated:** March 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Deployment Method 1 — Local (Manual) Run](#1-local-manual-run)
3. [Deployment Method 2 — Docker (Per-Service)](#2-docker-per-service)
4. [Deployment Method 3 — Docker Compose ✅ Included](#3-docker-compose--included)
5. [Deployment Method 4 — Kubernetes (K8s) ✅ Included](#4-kubernetes-k8s--included)
6. [Port Reference](#port-reference)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

DocRecords follows a **microservices architecture**. The system is composed of the following services:

| Service | Technology | Port |
|---|---|---|
| `frontend` | React + Vite (served via `serve`) | 5173 |
| `api-gateway` | Node.js | 4000 |
| `auth-service` | Node.js | 5001 |
| `patient-service` | Node.js | 5000 |
| `prescription-service` | Node.js | 5004 |
| `profile-control-service` | Node.js | 5008 |
| `mysql-db` | MySQL 8.0 | 3306 |

All backend services connect to a shared MySQL 8.0 database instance.

```
[Browser]
   │
   ▼
[Frontend :5173]
   │
   ▼
[API Gateway :4000]
   ├──► [Auth Service :5001]
   ├──► [Patient Service :5000]
   ├──► [Prescription Service :5004]
   └──► [Profile Control Service :5008]
              │
              ▼
         [MySQL DB :3306]
```

---

## 1. Local (Manual) Run

> ⚠️ **Not included in this repository.** This method describes running each service manually on the host machine for development purposes.

### When to Use
- Active development / debugging a single service
- No Docker or Kubernetes available on the machine

### Prerequisites
- Node.js 20+
- npm 9+
- MySQL 8.0 running locally

### Steps

#### 1.1 Start MySQL
Install and start MySQL locally, then create the required databases:
```sql
CREATE DATABASE auth_db;
CREATE DATABASE patient_db;
```
Run the init SQL scripts from `database/init/` and `database/docrecords_db_dump.sql`.

#### 1.2 Start Each Backend Service
For each service directory inside `backend/` (api-gateway, auth-service, patient-service, prescription-service, profile-control-service):
```bash
cd backend/<service-name>
npm install
npm start
```
Set environment variables for each service (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT) either via `.env` file or inline:
```bash
DB_HOST=localhost DB_USER=docrecords DB_PASSWORD=Doc_Records123 DB_NAME=auth_db npm start
```

#### 1.3 Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at: **http://localhost:5173**

### Limitation
Each terminal window must stay open per service. Managing 6+ processes manually is tedious — this method is best suited to running only the service being developed.

---

## 2. Docker (Per-Service)

> ⚠️ **Not included in this repository as individual run scripts.** Each service has its own `Dockerfile`.

### When to Use
- Containerising and testing a single service in isolation
- Building individual images for pushing to a container registry (e.g., Docker Hub, ECR, GCR)

### Prerequisites
- Docker Engine 24+

### Building Images Individually

Each service directory contains a `Dockerfile`. Build as follows:

```bash
# API Gateway
docker build -t docrecords/api-gateway:latest ./backend/api-gateway

# Auth Service
docker build -t docrecords/auth-service:latest ./backend/auth-service

# Patient Service
docker build -t docrecords/patient-service:latest ./backend/patient-service

# Prescription Service
docker build -t docrecords/prescription-service:latest ./backend/prescription-service

# Profile Control Service
docker build -t docrecords/profile-control-service:latest ./backend/profile-control-service

# Frontend (multi-stage build: builds Vite app then serves with `serve`)
docker build -t docrecords/frontend:latest ./frontend
```

### Running a Single Container
```bash
docker run -d \
  -p 5001:5001 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=docrecords \
  -e DB_PASSWORD=Doc_Records123 \
  -e DB_NAME=auth_db \
  -e DB_PORT=3306 \
  --name auth-service \
  docrecords/auth-service:latest
```

> **Note:** Use `host.docker.internal` to reach a MySQL instance running on the host machine, or create a Docker network and run MySQL as a container alongside.

### Frontend Docker Build Notes
The frontend uses a **multi-stage Docker build**:
1. **Stage 1 (builder):** Uses `node:20-alpine` to run `npm run build` (produces `dist/`)
2. **Stage 2 (runtime):** Uses `node:20-alpine` + `serve` to host the static `dist/` folder

---

## 3. Docker Compose ✅ Included

> ✅ **This is the primary deployment method included in the repository.**  
> Configuration file: [`docker-compose.yml`](./docker-compose.yml)

### When to Use
- Full-stack local development and testing
- Staging environments on a single host
- Demonstrating the application without Kubernetes

### Prerequisites
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
```

Verify installation:
```bash
docker --version
docker compose version
```

### Service Topology (Docker Compose)

| Service | Image / Build | Port | Depends On |
|---|---|---|---|
| `mysql-db` | `mysql:8.0` | 3306 | — |
| `auth-service` | `./backend/auth-service` | 5001 | mysql-db |
| `patient-service` | `./backend/patient-service` | 5000 | mysql-db |
| `prescription-service` | `./backend/prescription-service` | 5004 | mysql-db |
| `profile-control-service` | `./backend/profile-control-service` | 5008 | mysql-db |
| `api-gateway` | `./backend/api-gateway` | 4000 | all backend services |
| `frontend` | `./frontend` | 5173 | api-gateway |

### Commands

#### Start the Application
```bash
# Build images and start all services in the background
docker compose up --build -d
```

#### Stop the Application
```bash
# Stop and remove containers + volumes
docker compose down -v
```

#### View Logs
```bash
# Stream logs from all services
docker compose logs -f

# Stream logs from a specific service
docker compose logs -f api-gateway
```

#### Restart a Single Service
```bash
docker compose restart auth-service
```

#### View Running Services
```bash
docker compose ps
```

### Access the Application
- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:4000

### Database Initialisation
On first run, the MySQL container automatically runs:
1. Init scripts from `database/init/`
2. `database/docrecords_db_dump.sql` (prepopulates schema and seed data)

---

## 4. Kubernetes (K8s) ✅ Included

> ✅ **Kubernetes manifests are included in the repository.**  
> Configuration files: [`k8s/`](./k8s/)

### When to Use
- Production deployments
- High-availability environments with auto-scaling and self-healing
- Multi-node cluster environments (cloud or on-premise)

### Prerequisites
- Kubernetes cluster (Minikube for local, or cloud: EKS / GKE / AKS)
- `kubectl` configured and pointing to your cluster
- Docker images pre-built and **loaded into the cluster** (for local Minikube use)

### K8s Manifest Structure

```
k8s/
├── namespace.yaml                          # docrecords namespace
├── mysql/
│   ├── mysql-pv.yaml                       # PersistentVolume
│   ├── mysql-deployment.yaml               # MySQL Deployment
│   └── mysql-service.yaml                  # MySQL ClusterIP Service
├── backend/
│   ├── api-gateway.yaml                    # Deployment + Service
│   ├── auth-service.yaml                   # Deployment + Service
│   ├── patient-service.yaml                # Deployment + Service
│   ├── prescription-service.yaml           # Deployment + Service
│   └── profile-control-service.yaml        # Deployment + Service
└── frontend/
    └── frontend.yaml                       # Deployment + NodePort Service
```

### Deployment Steps

#### Step 1 — Build Docker Images (Minikube / Local)
```bash
# If using Minikube, point Docker to Minikube's daemon first
eval $(minikube docker-env)

# Build all images
docker compose build
```

For cloud environments, push images to a container registry and update the `image:` field in each YAML.

#### Step 2 — Create the Namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

#### Step 3 — Deploy MySQL (with Persistent Storage)
```bash
kubectl apply -f k8s/mysql/mysql-pv.yaml
kubectl apply -f k8s/mysql/mysql-deployment.yaml
kubectl apply -f k8s/mysql/mysql-service.yaml
```

Wait for MySQL to be ready:
```bash
kubectl rollout status deployment/mysql -n docrecords
```

#### Step 4 — Deploy Backend Services
```bash
kubectl apply -f k8s/backend/auth-service.yaml
kubectl apply -f k8s/backend/patient-service.yaml
kubectl apply -f k8s/backend/prescription-service.yaml
kubectl apply -f k8s/backend/profile-control-service.yaml
kubectl apply -f k8s/backend/api-gateway.yaml
```

#### Step 5 — Deploy Frontend
```bash
kubectl apply -f k8s/frontend/frontend.yaml
```

#### Step 6 — Access the Application

The frontend is exposed via a **NodePort** service on port **30073**:

```bash
# Minikube
minikube service frontend -n docrecords

# Or directly via node IP
kubectl get nodes -o wide   # note the node's EXTERNAL-IP
# Access at: http://<NODE-IP>:30073
```

### Useful K8s Commands

```bash
# List all resources in the namespace
kubectl get all -n docrecords

# View pod logs
kubectl logs -f deployment/api-gateway -n docrecords

# Describe a pod (debugging)
kubectl describe pod <pod-name> -n docrecords

# Delete all resources
kubectl delete namespace docrecords
```

### K8s Service Ports Summary

| Service | Type | Cluster Port | NodePort |
|---|---|---|---|
| `mysql` | ClusterIP | 3306 | — |
| `auth-service` | ClusterIP | 5001 | — |
| `patient-service` | ClusterIP | 5000 | — |
| `prescription-service` | ClusterIP | 5004 | — |
| `profile-control-service` | ClusterIP | 5008 | — |
| `api-gateway` | ClusterIP | 4000 | — |
| `frontend` | NodePort | 5173 | **30073** |

> **Note:** All backend services use `imagePullPolicy: Never`, meaning Docker images must be available locally on the cluster node (suitable for Minikube or k3s environments).

---

## Port Reference

| Service | Local Dev | Docker Compose | K8s NodePort |
|---|---|---|---|
| Frontend | 5173 | 5173 | 30073 |
| API Gateway | 4000 | 4000 | — (internal) |
| Auth Service | 5001 | 5001 | — (internal) |
| Patient Service | 5000 | 5000 | — (internal) |
| Prescription Service | 5004 | 5004 | — (internal) |
| Profile Control Service | 5008 | 5008 | — (internal) |
| MySQL | 3306 | 3306 | — (internal) |

---

## Troubleshooting

### Docker Compose: MySQL not ready
Backend services might start before MySQL is fully initialised. Restart the failing service:
```bash
docker compose restart auth-service
```

### K8s: ImagePullBackOff
Images are set to `imagePullPolicy: Never`. Ensure you built images inside Minikube's Docker daemon:
```bash
eval $(minikube docker-env)
docker compose build
```

### K8s: Pods stuck in Pending
Check if the PersistentVolume was created and is `Available`:
```bash
kubectl get pv
kubectl get pvc -n docrecords
```

### Port already in use
Check and kill the process holding the port:
```bash
sudo lsof -i :<port>
sudo kill -9 <PID>
```

---

*For API testing, use the included Postman collection: `DocRecords_E2E_postman_collection.json`*
