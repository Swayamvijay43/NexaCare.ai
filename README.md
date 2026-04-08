# NexaCare.ai 🏥✨
**Predict. Prevent. Personalize.**

NexaCare.ai is an advanced predictive healthcare analytics platform designed to bridge the gap between clinical monitoring and patient health awareness. Using machine learning and intelligent data layers, it identifies high-risk paths before deterioration, giving clinicians the window to act and patients the knowledge to manage their health.

---

## 🚀 What We Have Implemented (Current Progress)

### 1. Dual-Portal Architecture
We successfully built a robust, Role-Based Access Control (RBAC) architecture supporting 3 primary user roles: **Clinicians**, **Admins**, and **Patients**.

* **Landing Page**: A striking, medical-grade marketing page with interactive components, dynamic scrolling tickers, pricing tiers, and direct entry points to both portals.
* **Clinician / Admin Portal (`/dashboard`)**:
  * **Overview Dashboard**: High-level system stats.
  * **Patient Roster**: Sortable list of patients with live risk scores.
  * **Patient Detail View**: Deep-dive into a patient's vitals, alerts, and predicted trajectories.
  * **Live Risk Calculator**: Manual risk scoring tool for doctors.
  * **Alerts Hub**: Track critical and high-priority medical alerts.
  * **Forecasting (Admin Only)**: 7-day predictive models for ICU bed and staffing requirements.
  * **AI Chat Co-pilot**: An intelligent assistant that answers queries about patient risks, discharges, and bed capacity using live database context.

* **Patient Portal (`/patient-portal`)**:
  * **Authentication**: Patient-specific secure login/registration flow.
  * **Health Assessment Form**: Input personal information, vitals, blood work, and lifestyle factors.
  * **Multi-Disease Prediction Results**: Visual risk scoring for Diabetes, Heart Disease, and Hypertension.
  * **XAI (Explainable AI)**: Human-readable SHAP-value bar charts showing exactly which factors increased or decreased risk.
  * **Personalized Recommendations**: Actionable, AI-generated lifestyle advice grouped by urgency.
  * **Historical Tracking**: A timeline of past predictions to track health improvements over time.

### 2. Full-Stack Backend API (Node.js + Express)
* **PostgreSQL + Prisma ORM**: Fully structured database schema containing `User`, `Patient`, `Alert`, `Forecast`, and `HealthRecord` models.
* **REST APIs**: Complete CRUD routes for auth, patients, alerts, forecasting, and the central AI chat.
* **Patient Portal Proxy**: Securely routes patient health inputs to the ML service and logs the results to the database.
* **Authentication**: JWT-based login, signup, and middleware verification.
* **Automated Seeding**: Contains a comprehensive seed script populating 10 demo patients, alerts, 7-day forecasts, and demo users.

### 3. ML Prediction Service (Python + FastAPI)
* We rewrote the baseline ML engine into an advanced multi-disease prediction API.
* **`/predict`**: Original clinical risk endpoint based on vital signs (Heart rate, O2, BP, Temp).
* **`/explain`**: Complex feature engine evaluating metabolic and cardiovascular data. Returns risk tiers, disease probabilities, SHAP-like feature importance values, and contextual health recommendations.
* **Graceful Fallbacks**: If the ML service is unreachable, the Node.js backend features an identical algorithmic fallback to ensure platform demos never break.

### 4. Infrastructure & Integration
* Next.js Frontend seamlessly connected to the Express backend via Axios.
* Fully containerized setup via `docker-compose` linking the Frontend, Backend, ML Service, and PostgreSQL database.
* Configured local `.env` variables and `Next.js` route-protection middleware.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide Icons
* **Backend**: Node.js, Express, Prisma ORM, JWT Auth, bcrypt
* **Database**: PostgreSQL
* **Machine Learning**: Python, FastAPI
* **Deployment/DevOps**: Docker, Docker Compose

---

## 🏃‍♂️ How to Run Locally

### Prerequisites
Make sure you have Docker, Node.js, and Python installed.

### 1. Start the Database and Services
From the root directory, you can spin everything up using Docker:
```bash
docker-compose up -d
```
*(This commands starts PostgreSQL, the Backend on port 5000, the ML Service on port 8000, and the Frontend on port 3000)*

### 2. Seed the Database
To populate the database with demo patients and users, run the Prisma seed script inside the backend:
```bash
cd backend
npm install
npm run db:reset
```

### 3. Access the Platforms
* **Main Website**: http://localhost:3000
* **Doctor Login**: http://localhost:3000/login
* **Patient Portal Login**: http://localhost:3000/patient-portal/login

**Demo Accounts (Password for all: `demo123`)**:
* Clinician: `dr.sarah@nexacare.ai`
* Admin: `admin@nexacare.ai`
* Patient: `patient@nexacare.ai`
