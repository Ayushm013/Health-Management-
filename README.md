# ArogyaPulse (आरोग्य पल्स) — Unified Indian Health Management System

**ArogyaPulse (आरोग्य पल्स)** is a modern, responsive, production-ready full-stack healthcare platform tailored to the Indian healthcare ecosystem. Engineered with **Ayushman Bharat Digital Mission (ABDM)** compliance principles, it centralizes 14-digit **ABHA (Ayushman Bharat Health Account)** health IDs, Indian diagnostic lab records (Dr. Lal PathLabs, Apollo, AIIMS), National Medical Commission (NMC) licensed doctor consultations, digital OPD prescriptions with Indian meal schedules, and comprehensive vitals tracking in INR (`₹`).

---

## 🔑 Demo Login Credentials

For live evaluation and academic defense, use these pre-seeded Indian test accounts or use the **1-Click Demo Persona Switcher** directly in the UI header:

| Role | Name | Email | Password | ABHA / Council ID | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Patient** | Rohan Verma | `rohan@arogyapulse.in` | `Patient@12345` | ABHA: `91-4421-8890-1204` | ABHA health card, vitals (BP/Sugar/BMI), Dr. Lal PathLabs EHR, Indian medication schedules (नाश्ते के बाद), ₹ appointments |
| **Doctor** | Dr. Rajesh K. Sharma, MD, DM | `dr.rajesh@arogyapulse.in` | `Doctor@12345` | DMC: `DMC-24108` | Senior Cardiologist at Apollo Heart Centre; OPD queues, clinical notes, multi-medicine digital prescriptions |
| **Doctor** | Dr. Ananya Iyer, MD, DM | `dr.ananya@arogyapulse.in` | `Doctor@12345` | KMC: `KMC-51820` | Consultant Neurologist at Manipal Hospital; review patient ABHA history, teleconsultations |
| **Admin** | Dr. A. Swaminathan | `admin@arogyapulse.in` | `Admin@12345` | NMC: `NMC-AD-1002` | Medical Superintendent; Hospital analytics, doctor NMC license verification, ABDM audit logs |

*(Backward-compatible email aliases such as `elena@healthpulse.com`, `dr.chen@healthpulse.com`, and `admin@healthpulse.com` are also mapped and function seamlessly).*

---

## 🩺 Important Healthcare Notice & Indian Emergency Helplines

> **Medical Notice:** This platform is intended for health information management, workflow demonstration, and educational purposes. It is **not** a substitute for professional medical diagnosis, treatment, or emergency clinical care.
> 
> **For medical emergencies in India, dial immediately:**
> - **108** — Ambulance & Medical Emergency Response Service
> - **112** — All-in-One National Emergency Helpline
> - **1075** — National Health Helpline (Ministry of Health & Family Welfare)

---

## 🌟 Key Functional Modules

### 1. Patient Portal
- **Centralized Dashboard:** Real-time summary cards for upcoming appointments, active medications, archived records, and calculated BMI.
- **Appointment Booking:** Step-by-step specialist booking with collision detection preventing double-booking. Supports in-person and video visits.
- **Biometric Vitals & Analytics:** Interactive Recharts for Blood Pressure (systolic/diastolic), Weight progress, Heart Rate, Glucose, SpO2, and Temperature with 7d/30d/3m/6m/1y filters.
- **Automatic BMI Calculation:** Dynamically calculated ($Weight / Height^2$) with standard classification categories (Underweight, Normal, Overweight, Obesity).
- **Reference Range Advisories:** Neutral informational alerts if readings are outside standard reference intervals.
- **Medication Adherence Tracker:** Daily reminder schedule with One-Click "Mark Taken" and "Skip", pill refill alerts, and weekly adherence percentage computation.
- **Digital Prescriptions & Printable Layout:** Multi-medicine electronic prescriptions with official printable layout (`window.print()` friendly with Rx emblem, doctor license, and signature line).
- **Diagnostic Records Archive:** Upload, inspect, filter, and download simulated lab reports, blood panels, ECGs, and radiology scans.
- **Daily Wellness Tracker:** Daily logging for water intake, sleep duration, steps, active calories, exercise minutes, and mood.
- **Doctor-Patient Messaging:** Confidential chat thread with authorized care providers.

### 2. Doctor Clinical Desk
- **Consultation Queue:** Real-time timeline of today's schedule with patient age, consultation mode, and reason for visit.
- **Appointment Management:** Accept, reject, reschedule, or mark appointments as completed with detailed consultation notes.
- **Patient EHR Inspection:** Inspect assigned patients' allergies, chronic conditions, surgical history, past prescriptions, and diagnostic lab reports.
- **Digital Prescription Generator:** Prescribe multiple drugs with dosage, frequency, duration, and instructions; automatically updates the patient's active medication schedule upon issue.
- **Credential Management:** Update clinic locations, consultation fee, available days, and medical licenses.

### 3. Administrator Console
- **System Metrics & Analytics:** Recharts visualizations for user registration trends, appointments volume by status, specialty distributions, and document uploads.
- **User Directory:** View, search, and toggle active/inactive status or remove accounts.
- **Physician Verification:** Audit license numbers and approve or reject clinical practitioner access.
- **Security Audit Logs:** Tamper-evident ledger recording user actions, timestamps, entity IDs, and client IP addresses.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Recharts data visualization.
- **Backend:** Node.js, Express, tsx runtime.
- **Security:** JWT authentication, bcrypt password hashing, Role-Based Access Control (RBAC), input sanitization, and audit logging.
- **Persistence:** In-memory relational schema with atomic JSON file persistence (`data/database.json`).

---

## 🚀 Running the Application Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server (Full-Stack Express + Vite):**
   ```bash
   npm run dev
   ```
   The dev server will be accessible at `http://localhost:3000`.

3. **Build for Production:**
   ```bash
   npm run build
   ```

4. **Start Production Server:**
   ```bash
   npm start
   ```

---

## 📡 REST API Architecture

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register patient or doctor account |
| `/api/auth/login` | `POST` | Public | Authenticate with JWT token & bcrypt hash |
| `/api/auth/me` | `GET` | Authenticated | Retrieve current user profile |
| `/api/patients/profile` | `GET/PUT` | Patient | View and update patient health profile |
| `/api/doctors` | `GET` | Public | List verified doctors with specialty filters |
| `/api/doctors-patients` | `GET` | Doctor/Admin | Retrieve authorized patients |
| `/api/appointments` | `GET/POST` | Authenticated | Query and schedule consultation slots |
| `/api/appointments/:id` | `PUT/DELETE` | Authenticated | Update status, add notes, or cancel |
| `/api/medical-records` | `GET/POST` | Authenticated | Manage archived diagnostic reports |
| `/api/prescriptions` | `GET/POST` | Authenticated | View and create digital prescriptions |
| `/api/medications` | `GET/POST` | Patient | Manage daily medication schedules |
| `/api/medications/:id/adherence` | `POST` | Patient | Record taken/skipped dose adherence |
| `/api/health-metrics` | `GET/POST` | Patient | Log and retrieve biometric vitals |
| `/api/health-goals` | `GET/POST/PUT` | Patient | Set and track personal wellness targets |
| `/api/daily-tracking` | `GET/POST` | Patient | Log daily water, sleep, steps, and mood |
| `/api/notifications` | `GET/PUT` | Authenticated | Notification center and read state |
| `/api/messages` | `GET/POST` | Authenticated | Doctor-patient chat messaging |
| `/api/admin/stats` | `GET` | Admin | Comprehensive analytics and chart data |
| `/api/admin/users` | `GET` | Admin | View user directory |
| `/api/admin/doctors/:id/verify` | `PUT` | Admin | Approve or reject doctor verification |
| `/api/admin/audit-logs` | `GET` | Admin | Query security audit ledger |
