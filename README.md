# 🏥 DocRecords

> A microservices-based **Medical Records Management System** built with React, Node.js, and MySQL — containerised with Docker and deployable on Kubernetes.

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](./docker-compose.yml)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Manifests-326CE5?logo=kubernetes&logoColor=white)](./k8s/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)]()
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)]()
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1?logo=mysql&logoColor=white)]()

---

## 📋 Overview

DocRecords is a full-stack, containerised healthcare records platform following a **microservices architecture**. It enables management of patient records, prescriptions, authentication, and user profiles through dedicated, independently deployable services behind a centralised API gateway.

---

## 🏗️ Architecture

```
[Browser]
    │
    ▼
[Frontend :5173]  (React + Vite)
    │
    ▼
[API Gateway :4000]
    ├──► [Auth Service          :5001]
    ├──► [Patient Service       :5000]
    ├──► [Prescription Service  :5004]
    └──► [Profile Control Svc   :5008]
                  │
                  ▼
          [MySQL 8.0 :3306]
```

### Services

| Service | Port | Responsibility |
|---|---|---|
| `frontend` | 5173 | React + Vite UI (served via `serve`) |
| `api-gateway` | 4000 | Single entry point — routes to backend services |
| `auth-service` | 5001 | Authentication & authorisation |
| `patient-service` | 5000 | Patient records management |
| `prescription-service` | 5004 | Prescription management |
| `profile-control-service` | 5008 | User profile management |
| `mysql-db` | 3306 | Shared MySQL 8.0 database |

---

## 🚀 Quick Start — Docker Compose

The fastest way to run the full application is with **Docker Compose**.

### Prerequisites

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
```

### Run

```bash
# Clone the repository
git clone <repo-url>
cd DocRecords_DockerCompose

# Build and start all services
docker compose up --build -d
```

Application will be available at: **http://localhost:5173**

### Stop

```bash
docker compose down -v
```

### Logs

```bash
docker compose logs -f
```

---

## ☸️ Kubernetes Deployment

Kubernetes manifests are available under `k8s/`. The frontend is exposed via a **NodePort** on port **30073**.

```bash
# Apply namespace
kubectl apply -f k8s/namespace.yaml

# Deploy MySQL with persistent storage
kubectl apply -f k8s/mysql/

# Deploy backend services
kubectl apply -f k8s/backend/

# Deploy frontend
kubectl apply -f k8s/frontend/

# Access (Minikube)
minikube service frontend -n docrecords
```

> See [DocRecords_Deployment.md](./DocRecords_Deployment.md) for the full deployment guide, including local, Docker, Docker Compose, and Kubernetes instructions.

---

## 📁 Project Structure

```
DocRecords_DockerCompose/
├── backend/
│   ├── api-gateway/              # API Gateway service
│   ├── auth-service/             # Authentication service
│   ├── patient-service/          # Patient management service
│   ├── prescription-service/     # Prescription service
│   └── profile-control-service/  # Profile management service
├── frontend/                     # React + Vite application
├── database/
│   ├── init/                     # DB initialisation scripts
│   └── docrecords_db_dump.sql    # Database seed/schema dump
├── k8s/
│   ├── namespace.yaml
│   ├── mysql/                    # MySQL PV, Deployment, Service
│   ├── backend/                  # Backend service manifests
│   └── frontend/                 # Frontend Deployment + NodePort
├── docker-compose.yml
├── DocRecords_Deployment.md      # Full deployment guide
└── DocRecords_E2E_postman_collection.json
```

---

## 🧪 API Testing

An end-to-end Postman collection is included at the project root:

```
DocRecords_E2E_postman_collection.json
```

Import it into [Postman](https://www.postman.com/) and run the collection against the running application.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, served via `serve` |
| Backend | Node.js 20 (Alpine) |
| Database | MySQL 8.0 |
| Containerisation | Docker, Docker Compose |
| Orchestration | Kubernetes (Minikube / Cloud) |

---

## 📖 Documentation

- **[DocRecords_Deployment.md](./DocRecords_Deployment.md)** — Complete guide for all deployment methods

---

## 📄 License

This project is developed as part of an Advanced Software Engineering project.
