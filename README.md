# Project Management Application

A full-stack project management application with a Node.js/Express & MySQL backend and a React frontend.

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
```

#### Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
# On Windows PowerShell:
# Copy-Item .env.example .env
```

#### Install Dependencies
```bash
npm i
```

#### Database Setup & Seeding
Ensure your MySQL server is running, then populate the database with initial tables and dummy data:
```bash
npm run seed
```

> **Seed Accounts:**
> - **Admin:** `admin@example.com` | `Admin@123`
> - **Project Manager:** `pm@example.com` | `Pm@12345`
> - **Team Member:** `john@example.com` | `Member@123`
> - **Team Member:** `jane@example.com` | `Member@123`

#### Start Backend
```bash
npm start
```
Backend runs on `http://localhost:5000`.

---

### 2. Frontend Setup

Open a new terminal window:

```bash
cd frontend
```

#### Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
# On Windows PowerShell:
# Copy-Item .env.example .env
```

#### Install Dependencies
```bash
npm i
```

#### Start Frontend
```bash
npm start
```
Frontend runs on `http://localhost:3000`.
