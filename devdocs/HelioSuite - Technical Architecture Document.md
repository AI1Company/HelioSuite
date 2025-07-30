# **HelioSuite**

### **Technical Architecture Document**

---

## **1\. Executive Summary**

HelioSuite is a modular, Firebase-based SaaS platform designed with an offline-first mobile companion and deeply integrated AI services for proposal generation. Its architecture enables rapid MVP iteration, high availability, and regional scalability. The platform streamlines lead tracking, proposal generation, field operations, and billing for solar installation businesses, with an initial focus on the underserved South African market.

---

## **2\. High-Level Architecture**

HelioSuite’s architecture centers on three key components interacting with Firebase as the unified backend:

* **Web Dashboard:** Primary interface for administrative tasks and CRM management.

* **Mobile App (Field):** Offline-first mobile solution for field technicians.

* **AI Proposal Engine:** Backend service responsible for generating solar proposals using AI.

**System Interaction Overview:**

\+---------------------+    \+--------------------+  
|   Web Dashboard     | \<-\>| Firebase (Auth, DB) |  
\+---------------------+    \+--------------------+  
          ^                        ^  
          |                        |  
\+--------------------+    \+--------------------+  
| Mobile App (Field) | \<--\>| Firestore (Offline) |  
\+--------------------+    \+--------------------+  
          |                        |  
          v                        v  
\+--------------------+    \+--------------------+  
| AI Proposal Engine | \<-\>|   Cloud Functions   |  
\+--------------------+    \+--------------------+

---

## **3\. Technology Stack**

HelioSuite uses a modern, cloud-native stack optimized for speed, scalability, and flexibility:

* **Frontend (Web):** React \+ TailwindCSS

* **Mobile App:** React Native (Expo)

* **Backend Logic:** Firebase Functions (Node.js \+ TypeScript)

* **Authentication & Database:** Firebase Auth \+ Firestore

* **AI Services:** OpenAI \+ LangChain

* **Hosting:** Firebase Hosting

---

## **4\. Primary Components & Modules**

### **CRM Module**

Manages leads, jobs, clients, customer records, and contact history. Supports creating, editing, and viewing customer profiles.

### **AI Proposal Engine**

A core differentiator that transforms project data into ready-to-share PDF solar proposals using structured prompts, LangChain, and GPT-4-turbo. Features include:

* Product selection and dynamic prompt generation

* AI prompt editing (admin-level)

* PDF generation via cloud-based LLM

### **Mobile App (Technician)**

Provides field technicians with access to assigned jobs, photo uploads, and job completion syncing—all with offline support via IndexedDB.

### **Project Management**

Supports job creation, technician scheduling, and task status tracking.

### **Admin & Permissions**

Enables management of user roles and access control. Admins can also configure pre-prompts and default AI values.

### **Dashboard & Reporting**

Tracks jobs completed, quotes sent, and team activity. Also handles subscription management and billing.

---

## **5\. Data Flow Overview**

### **Core Flow Stages:**

1. **Authentication:** Via Firebase Auth

2. **CRM Interaction:** Data stored and retrieved from Firestore

3. **AI Quoting:** Triggered via Cloud Functions → LangChain → OpenAI

4. **Field Logging:** Technicians log job data via mobile app (offline capable)

5. **Sync:** Mobile data is pushed to Firestore when online

**Cross-System Data Sync Highlights:**

* **Mobile App:** Uses a local queue synced to Firestore with a flushQueue() function.

* **Web Admin:** Triggers AI quotes and stores results directly to Firestore.

* **Firebase Backend:** Handles notifications and logs via Cloud Functions.

---

## **6\. Firebase Architecture Details**

### **Key Firebase Components:**

* **Auth:** Role-based login with Firebase Authentication

* **Firestore:** Primary NoSQL DB for all core data (users, clients, jobs, proposals)

  * Key collections include: `/users`, `/clients`, `/jobs`, `/products`, `/proposals`

* **Cloud Functions:**

  * `generateProposal()` – Triggers AI proposal generation

  * `logSyncError()` – Logs sync failures

  * `sendNotif()` – Handles notifications

* **Firebase Storage:**

  * Photos: `/jobs/{id}/photos/`

  * Proposals: `/proposals/{id}/quote.pdf`

* **Hosting:** Serves the Web Admin Portal

* **Offline Support:**

  * IndexedDB queue in mobile app

  * `flushQueue()` syncs offline data using timestamp reconciliation

---

## **7\. Security and Permissions**

### **Role-Based Access Control (RBAC)**

* **Owner:** Full access to all modules and analytics

* **Admin:** Full CRM, quote, and user management access

* **Sales Rep:** Can manage leads and generate proposals

* **Technician:** Job-level access only for assigned work

### **Security Mechanisms**

* **Firestore Rules:** Granular read/write rules by role

* **Storage Rules:**

  * Upload access limited to original uploader

  * View access for admins only

* **Authentication Flow:**

  * Firebase Auth login

  * Roles set via custom claims

  * UI adjusts based on role

### **Security Testing**

* Tools: `@firebase/rules-unit-testing`, Firestore Emulator, Jest

* Focus: Preventing privilege escalation and enforcing least-privilege design

* Compliance:

  * Firebase Auth for credential handling

  * Encryption at rest and in transit

  * Scoped access to photo uploads

  * Event logging via Firestore listeners

---

## **8\. Build and Deployment**

### **Local Development Setup**

* Requirements: Node.js, Yarn, Firebase CLI, Expo CLI

* Developers clone the repo, install dependencies, and start dev servers per component (web, mobile)

### **CI/CD Workflow**

* Managed via GitHub Actions (`ci.yml`, `deploy.yml`)

* Triggered on push or PR to main

* Workflow includes:

  1. Dependency installation

  2. Linting, unit, and integration tests

  3. Firebase function and web deployment

  4. Slack notification post-deploy

### **Merge Requirements**

* All PRs must:

  * Pass CI tests

  * Be reviewed and approved

  * Be merged from `dev` → `main`

### **Secrets Management**

* Local: Managed via `.env` files (excluded from git)

* CI/CD: Managed via GitHub Secrets (e.g., `FIREBASE_TOKEN`, `OPENAI_API_KEY`)

---

## **9\. AI Integration Details**

### **AI Features**

* **Proposal Generation:** Produces PDF proposals with projected savings and solar specs

* **Input Enrichment:** Fills gaps in data using inferred defaults

* **Language Localisation (Planned):** Will support translation into Afrikaans, Zulu, etc.

### **AI Lifecycle**

1. User input captured via form

2. Preprocessor formats and validates input

3. Prompt Builder assembles system/user prompts

4. LangChain forwards to GPT-4-turbo (retry \+ fallback enabled)

5. Output processed: Text → HTML → PDF

6. Audit log created with token usage details

### **Prompt Engineering**

* **System Prompt:** Fixed role-based guidance (e.g., "You are a solar consultant…")

* **User Prompt:** Dynamic, customer-specific inputs

* **Versioning:** Prompt formats are versioned and tested for consistency

### **Token Budgeting**

* Budget per proposal: ≤ $0.10 (\~2,100 tokens)

* Proposal limits enforced by plan tier (Starter, Pro, Enterprise)

* Limits managed via Firebase custom claims

---

## **10\. Scaling Strategy**

* **Firebase Scalability:** Begins with a single project, expandable to region-specific setups

* **Database Optimization:** Composite indexes and GCP monitoring in place

* **Modular Design:**

  * Compliance modules per region

  * i18n-ready

  * Custom AI prompt tuning per locale

---

## **11\. Key Differentiators**

* **AI-Native:** Fully integrated AI from day one

* **Mobile-First & Offline-Capable:** Built for teams in low-connectivity zones

* **Localized:** Supports VAT, Rand pricing, and regional UX needs

* **Modular:** Adaptable codebase for global expansion

* **Firebase-Based:** Fast, cost-effective deployment with real-time infrastructure

