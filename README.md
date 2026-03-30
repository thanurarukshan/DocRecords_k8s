# 🏥 DocRecords

> A microservices-based **Medical Records Management System** built with React, Node.js, and MySQL — deployable locally, with Docker Compose, or on Kubernetes.

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](./docker-compose.yml)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Manifests-326CE5?logo=kubernetes&logoColor=white)](./k8s/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)]()
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)]()
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1?logo=mysql&logoColor=white)]()

---

## 📋 Overview

DocRecords is a full-stack healthcare records platform following a **microservices architecture**. It enables management of patient records, prescriptions, authentication, and user profiles through dedicated, independently deployable services behind a centralised API gateway.

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
| `frontend` | 5173 | React + Vite UI |
| `api-gateway` | 4000 | Single entry point — routes to backend services |
| `auth-service` | 5001 | Authentication & authorisation (JWT) |
| `patient-service` | 5000 | Patient records management |
| `prescription-service` | 5004 | Prescription & medical history management |
| `profile-control-service` | 5008 | User profile CRUD |
| `mysql-db` | 3306 | Shared MySQL 8.0 database |

---

## 💻 Local Development

The simplest way to run DocRecords locally for development.

### Prerequisites

- **Node.js** (v18+) and **npm**
- **MySQL 8.0** running locally on port 3306 (root/root) with the database dump imported

### Setup MySQL

```bash
# Import the database schema and seed data
mysql -u root -p < database/docrecords_db_dump.sql
```

### Run

```bash
# Make the script executable (first time only)
chmod +x localRun.sh

# Start all services
./localRun.sh
```

The script will:
1. Check prerequisites (Node.js, npm)
2. Install dependencies in all service directories
3. Set local environment variables (`DB_HOST=localhost`)
4. Start all 6 services concurrently
5. Display service URLs

Application will be available at: **http://localhost:5173**

Press `Ctrl+C` to stop all services.

---

## 🐳 Quick Start — Docker Compose

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
│   ├── api-gateway/              # API Gateway (env-based proxy targets)
│   ├── auth-service/             # Authentication service (JWT, bcrypt)
│   ├── patient-service/          # Patient management service
│   ├── prescription-service/     # Prescription service
│   └── profile-control-service/  # Profile management service
├── frontend/                     # React + Vite application
├── database/
│   ├── init/                     # DB initialisation scripts
│   └── docrecords_db_dump.sql    # Database schema + seed data
├── k8s/
│   ├── namespace.yaml
│   ├── mysql/                    # MySQL PV, Deployment, Service
│   ├── backend/                  # Backend service manifests
│   └── frontend/                 # Frontend Deployment + NodePort
├── docker-compose.yml
├── localRun.sh                   # Local development runner script
├── DocRecords_Deployment.md      # Full deployment guide
└── DocRecords_E2E_postman_collection.json
```

---

## 🧪 API Endpoints

### Auth Service (`/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |

### Patient Service (`/patient`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/patient/patients/:id` | Get patient by ID |

### Prescription Service (`/prescription`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/prescription/medical-history/:patientId` | Get medical history |
| POST | `/prescription/add-prescription` | Add a new prescription |

### Profile Control Service (`/profile`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile/users/:id` | Get user profile |
| PUT | `/profile/users/:id` | Update user profile |
| DELETE | `/profile/users/:id` | Delete user profile |

> A Postman collection is included: `DocRecords_E2E_postman_collection.json`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 7, Inter font |
| Backend | Node.js + Express 5 |
| Database | MySQL 8.0 |
| Auth | JWT + bcrypt |
| Containerisation | Docker, Docker Compose |
| Orchestration | Kubernetes (k3s / Minikube) |

---

## 📖 Documentation

- **[DocRecords_Deployment.md](./DocRecords_Deployment.md)** — Complete guide for all deployment methods

---

## 📄 License

This project is developed as part of an Advanced Software Engineering project.
