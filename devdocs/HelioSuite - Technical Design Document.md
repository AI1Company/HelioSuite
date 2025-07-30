# **HelioSuite**

### **Technical Design Document**

---

## **1\. Introduction & Purpose**

This document provides a detailed system-level technical overview of the **HelioSuite** platform, tailored for development and infrastructure teams. It outlines the architecture, component interactions, security models, development standards, and technical workflows necessary to ensure system reliability, consistency, and long-term maintainability.

HelioSuite is architected as a modular, Firebase-based SaaS platform with an offline-first mobile application and integrated AI-powered proposal generation.

---

## **2\. High-Level Architecture**

The platform connects a **Web Dashboard**, **Mobile App**, and **AI Proposal Engine** to Firebase for authentication and database operations.

\+---------------------+     \+--------------------+  
|   Web Dashboard     | \<-\> | Firebase (Auth, DB)|  
\+---------------------+     \+--------------------+  
           ^                          ^  
           |                          |  
\+---------------------+     \+--------------------+  
| Mobile App (Field)  | \<-\> | Firestore (Offline)|  
\+---------------------+     \+--------------------+  
           |                          |  
           v                          v  
\+---------------------+     \+--------------------+  
|  AI Proposal Engine | \<-\> |  Cloud Functions   |  
\+---------------------+     \+--------------------+

This architecture supports real-time interaction, offline capability, MVP iteration, and scalable deployments across regions using Firebase quotas.

---

## **3\. Core Components & Technologies**

* **Web Frontend:** React \+ TailwindCSS, hosted on Firebase Hosting

* **Mobile App:** React Native (Expo), designed with offline-first architecture

* **Backend Logic:** Firebase Cloud Functions (Node.js \+ TypeScript)

* **Authentication & Database:** Firebase Auth \+ Firestore

* **AI Services:** OpenAI (GPT-4-turbo) integrated via LangChain

* **Hosting:** Firebase Hosting (web dashboard)

---

## **4\. Data Flow**

### **End-to-End Flow:**

1. **User Login:** Authenticated via Firebase Auth

2. **CRM Interaction:** Users manage leads, jobs, and clients (Firestore-backed)

3. **AI Quoting:** Admin triggers proposal generation → LangChain → OpenAI → PDF saved

4. **Field Logging:** Technicians log jobs using offline mobile app

5. **Sync:** Offline data queues sync automatically via a flush manager

### **Cross-Component Integration:**

* **Mobile App → Sync Manager → Firestore**

* **Web Dashboard → Firestore \+ Cloud Functions (Proposal)**

* **Cloud Functions → Notifications \+ Logging**

---

## **5\. Module Breakdown**

### **1\. Authentication Module**

* Firebase Auth (email/password)

* RBAC via Custom Claims: Admin, Technician, Sales Rep, Owner

### **2\. CRM Module**

* Manages leads, customers, job assignments

* Features: Lead Management, Job Scheduling, Customer Profiles, Task Tracking

### **3\. AI Proposal Engine**

* LangChain \+ OpenAI GPT-4-turbo

* Input enrichment, dynamic prompt building, editable PDF output

* Manual review/editing before proposal submission

### **4\. Mobile App (Technician)**

* React Native \+ Expo, IndexedDB for local cache

* Job updates, photo uploads, offline queuing with retry/sync logic

### **5\. Dashboard & Reporting**

* View team activity, quote metrics, and usage logs

* Billing management and upgrade functionality

### **6\. Admin Tools**

* User invitations and permission management

* AI prompt configuration and component catalog upload

### **7\. Notification Engine**

* Triggers: New Leads, Due Jobs, Follow-ups

* Sends SMS/email/push notifications

---

## **6\. AI Integration Details**

### **Proposal Generation**

* Converts input data into structured solar proposals (PDF)

* Includes savings projections, panel recommendations, visual formatting

### **AI Lifecycle**

1. **User Input** → 2\. **Preprocessor** →

2. **Prompt Builder** → 4\. **LLM Request** →

3. **Post-Processing** → 6\. **Audit Logging**

### **Prompt Structure**

* **System Prompt:** Fixed persona (e.g., solar consultant), tone, and constraints

* **User Prompt:** Dynamic values—name, location, usage, panel type, etc.

### **LLM Model**

* OpenAI GPT-4-turbo via LangChain

* Retry/fallback logic with prompt versioning

### **Token Budgeting**

* Cost goal: ≤ $0.10 per proposal (\~2,100 tokens)

* Tiered usage limits enforced via Firebase claims

### **Planned Enhancements**

* Localisation: Afrikaans, Zulu, etc.

* Persona-based prompt variations (e.g., SME vs. Enterprise tone)

---

## **7\. Security & Permissions**

### **Roles & Access**

* **Owner:** Full platform access, analytics, billing

* **Admin:** CRM, prompts, billing, user management

* **Sales Rep:** Lead management and proposal generation

* **Technician:** Assigned job access, photo uploads

### **Firebase Security Rules**

* Role-based read/write enforcement

* Scoped access: e.g., Technicians only access their jobs

* Storage permissions: Uploader-only write/delete; Admins read-only

### **Authentication Flow**

* Auth via Firebase

* Role injected via custom claims

* UI adjusted dynamically based on role

### **Validation & Testing**

* Client-side \+ backend validation

* Rule testing: `@firebase/rules-unit-testing`, Firestore Emulator

* Simulated attack scenarios and role-switch testing

---

## **8\. Development Guidelines & Structure**

### **Folder Structure**

* **/web:**

  * `src/components`: Shared UI

  * `src/pages`: Routes

  * `src/features`: CRM, Jobs, Proposals

  * `src/hooks`, `src/services`, `src/styles`

* **/mobile:**

  * `src/screens`, `src/components`, `src/storage` (IndexedDB/AsyncStorage)

  * `src/api`, `src/context`

* **/firebase:**

  * `functions`: AI, validation, notifications

  * `firestore.rules`, `firestore.indexes.json`

* **/shared:**

  * Utilities, TypeScript types, constants

### **Coding Conventions**

* React Hooks, functional components only

* TailwindCSS (web), StyleSheet API (mobile)

* TypeScript in all layers

* Naming: `PascalCase` for components, `camelCase` for functions, `kebab-case` for folders

### **Testing Strategy**

* **Unit Testing:** Vitest/Jest for functions, UI, Firebase logic

* **Integration Testing:** Playwright (web), Expo E2E Driver (mobile)

* **Manual QA:** End-to-end flows in staging with dummy data

### **Coverage Goals**

* ≥ 80% unit test coverage for critical modules

* 100% CI pass rate for merge eligibility

* QA signoff before each release

---

## **9\. Deployment & CI/CD**

### **Local Setup**

* Tools: Node.js, Yarn, Firebase CLI, Expo CLI

* `.env` files for local configuration (excluded from Git)

### **GitHub Actions Workflow**

* Trigger: PRs or commits to `main`

* Steps:

  1. Install dependencies

  2. Lint and run tests

  3. Deploy Firebase functions and hosting

  4. Notify Slack channel

### **Workflow Files**

* `.github/workflows/ci.yml`: Build \+ Test

* `.github/workflows/deploy.yml`: Deployment

### **Merge Protocol**

* All CI jobs must pass

* Reviewed and approved PRs from `dev` → `main` only

### **Secrets Management**

* Local: `.env` files

* CI/CD: GitHub Secrets (e.g., `FIREBASE_TOKEN`, `OPENAI_API_KEY`)

---

## **10\. Scaling Strategy**

### **Initial Phase**

* Single Firebase project for MVP

### **Regional Scaling**

* Multi-project structure for LATAM, APAC, etc.

* Modular codebase for localized compliance and VAT requirements

### **Database Optimization**

* Composite indexes in Firestore

* Monitoring via GCP dashboard

### **AI Cost Mitigation**

* Tier-based token limits (Starter, Pro, Enterprise)

* Caching and async prompt processing

### **Instant Tenant Setup**

* Firebase's project model supports fast onboarding and isolated data

