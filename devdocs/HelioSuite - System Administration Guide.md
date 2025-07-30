# **System Administration Guide**

---

## **Overview**

This document outlines the system administration responsibilities and infrastructure details for **HelioSuite**, an AI-powered SaaS platform for solar installation businesses. It covers architecture, CI/CD processes, user and role management, configuration, monitoring, security, testing, and cost management.

---

## **1\. System Architecture and Tech Stack**

HelioSuite is designed as a modular SaaS platform built entirely on Firebase infrastructure.

### **High-Level Architecture**

* **Web Admin Portal**: Built in ReactJS for CRM, proposals, reporting, and user role management.

* **Mobile App**: Built in React Native (Expo) with offline-first support for technicians.

* **AI Proposal Engine**: Uses Firebase Cloud Functions, LangChain, and the OpenAI API.

### **Primary Components**

* **Firebase Auth**: Manages email/password authentication and role-based access.

* **Firestore DB**: Stores CRM records, jobs, proposals, logs.

* **Firebase Functions**: Handles AI interactions, data validation, notifications.

* **Firebase Hosting**: Hosts the web admin portal.

* **Firebase Storage**: Stores job site images and proposal PDFs.

### **Data Flow Overview**

* Users authenticate via Firebase Auth.

* Interact with CRM, pipeline, and job modules stored in Firestore.

* AI Proposals generated via Cloud Functions with GPT-4-turbo.

* Technician input syncs from offline mobile app to Firestore upon reconnection.

### **External Services**

* **OpenAI API** for proposal generation.

* **(Planned)** SMS Gateway for lead notifications.

---

## **2\. Deployment and CI/CD**

### **Local Development Requirements**

* Node.js ≥ 18

* Yarn ≥ 1.22

* Firebase CLI

* Expo CLI

### **CI/CD Workflow (GitHub Actions)**

* **Trigger**: Every push or PR to `main`.

* **Steps**:

  * Install dependencies

  * Lint: `npm run lint`

  * Unit tests: `npm run test`

  * Integration tests with emulators

  * Deploy functions and hosting

  * Slack notifications

### **Key Files**

* `.github/workflows/ci.yml`

* `.github/workflows/deploy.yml`

### **Deployment Commands**

* Web Admin Portal:  
   `firebase deploy --only hosting:web-admin`

* Firebase Functions:  
   `firebase deploy --only functions`

* Mobile App (Expo):  
   `npx expo build:android`  
   `npx expo build:ios`

### **Secrets**

* `.env` files for local dev

* GitHub Secrets:  
   `FIREBASE_TOKEN`, `OPENAI_API_KEY`

---

## **3\. User and Role Management**

HelioSuite uses Firebase Authentication and Firestore Security Rules for RBAC.

### **Authentication**

* Email/password only (via Firebase Auth)

* Custom Claims define user roles

### **User Roles**

* **Admin**: Full access to all modules and user management. Can view logs and assign permissions.

* **Owner**: Views usage analytics, billing, and client data. Cannot access job/proposal generation.

* **Sales Rep**: Manages leads and proposals.

* **Technician**: Uses mobile app for assigned jobs. Limited access.

### **Admin Tools**

* Invite/manage users

* Assign roles

* Configure catalog and access logs

---

## **4\. Configuration Management**

### **AI Prompt Editing**

* Admins adjust AI prompt templates via configurable `preprompt/config` fields.

### **Product Selection Engine**

* Configurable component catalog (JSON) for solar components (panels, batteries, inverters).

### **Input Enrichment**

* Auto-fills assumptions for layout, mounting, and panel type from minimal input.

### **Localization**

* Multilingual support in development (e.g., Zulu, Afrikaans).

* Locale-sensitive AI prompts.

---

## **5\. Monitoring and Troubleshooting**

### **Usage Dashboards**

* View quotes sent, jobs completed, team activity, active users, and billing tier.

### **Analytics**

* Monitor trends and quote-to-job conversion rates. Team performance analytics coming soon.

### **Activity Logs**

* Logs include AI responses and token usage (visible to Admins).

### **Firebase Logs**

* Access via: `firebase functions:log`

### **Offline Sync Monitoring**

* `syncMonitor.ts`: Logs and health checks for offline queue.

* `logSyncError()`: Captures sync issues.

### **Postmortems**

* Documented via `postmortem-template.md` within 5 days post-release.

### **Known Issues**

* Found in release notes (e.g., technician sync conflicts, dark mode support on mobile pending).

---

## **6\. Security and Data Management**

### **Security Enforcement**

* Firestore Security Rules with RBAC enforce least-privilege access.

* Client-side and server-side validation in place.

### **Firestore Scopes**

* **Technicians**: Read only assigned jobs.

* **Admins**: Full write access.

* **Owners**: CRM read-only \+ billing.

### **Storage Rules**

* Technicians can only upload/view their job photos.

* Admins have broader access.

### **Data Structure**

* Firestore Collections: `users`, `customers`, `jobs`, `proposals`, `products`.

### **Compliance**

* Data encrypted in transit and at rest.

* Scoped access to uploads and sensitive data.

* Future releases will undergo POPIA review for South Africa.

---

## **7\. Testing and Quality Assurance**

### **Test Layers**

* **Unit Tests**:  
   Validate frontend/backend components using `vitest` or `jest`.

* **Integration Tests**:  
   Test data flow across components (e.g., Proposal Flow, Job Sync, Role Permissions).  
   Tools: Playwright, Expo E2E Driver, Firebase Emulator.

* **Manual QA**:  
   Full test coverage across devices using dummy datasets and staged environments.

### **CI Pipeline**

* Runs on each PR to `main`.

* Tests must pass for merges.

### **Coverage Targets**

* ≥ 80% unit test coverage

* 100% CI pass rate for merge eligibility

* Manual QA signoff for every release

---

## **8\. AI Cost Management**

HelioSuite uses a token budgeting system to manage and forecast AI costs.

### **Token Estimates**

* \~2,100 tokens per proposal:

  * 500 (prompt)

  * 1,500 (response)

  * 100 (post-processing)

* Estimated cost:  
   $0.006–$0.01 per proposal (buffered to $0.015)

### **Tier-Based Quotas**

* **Starter**: 15 proposals/month

* **Pro**: 100 proposals/month

* **Enterprise**: Unlimited (with internal alerts)

### **Usage Monitoring**

* Enforced via Firebase Custom Claims

* Token usage and user IDs logged

* Backend alert triggers for abnormal usage (3× norm in 24 hours)

