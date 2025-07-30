# **HelioSuite v1.0**

### **Product Requirements Document**

---

## **1\. Introduction and Purpose**

This document outlines the functional and non-functional requirements for **HelioSuite**, an AI-powered SaaS platform purpose-built for solar installation companies. The platform replaces fragmented tools with a unified solution, streamlining lead tracking, proposal generation, field operations, and billing. Its mission is to empower solar businesses with intelligence, efficiency, and transparency.

---

## **2\. Vision and Mission**

**Vision:**  
 Empower every solar installation business—from startups to enterprises—to operate with intelligence, efficiency, and transparency through a unified, AI-powered platform. The goal is to reduce administrative overhead, enable faster and more accurate quotes, and provide visibility for scalable operations.

**Mission:**  
 To build the most reliable all-in-one operational platform for solar SMEs in emerging markets—equipped with AI, offline-first mobile tools, and industry-specific workflows. This includes simplifying quoting and scheduling, enhancing communication, and localising for markets such as South Africa.

---

## **3\. Target Audience and Personas**

**Target Market:**  
 Small-to-medium solar installation businesses, initially focused on South Africa.

**User Personas:**

* **Installer Technician (Field Worker):** Uses the mobile app, requires offline functionality, and records job details, photos, and updates.

* **Operations Manager (Office Admin):** Manages CRM, proposals, and leads from the web dashboard.

* **Business Owner:** Monitors team productivity and financial performance via usage dashboards and reports.

---

## **4\. Scope (v1.0)**

### **Included:**

* Mobile-first CRM to manage leads, jobs, clients, and a product library.

* AI-powered proposal generation using LangChain, OpenAI, and Firestore.

* Admin Portal for job tracking, messaging, and documentation.

* React Native mobile app with offline-first functionality.

* Project dashboard with timeline, invoicing, and status tracking.

* Role-based user access via Firebase Auth.

### **Excluded (v1.0):**

* CAD/3D design integrations.

* Marketplace for solar components.

* Advanced payment processing (basic Stripe integration planned).

* Full internationalization (limited to English UI).

### **Constraints:**

* Firebase-based architecture.

* Offline-first mobile features are mandatory due to field conditions.

* South Africa-focused pilot, English UI, Rand pricing.

* MVP, pilot, and feedback timeline limited to 3 months.

---

## **5\. Key Features (v1.0)**

### **CRM & Admin Dashboard**

* Lead and client management.

* Job scheduling and technician assignment.

* Customer profiles and solar history.

* Team progress tracking.

* User management, AI prompt config, component catalog upload.

### **AI Proposal Generator**

* Product selection engine for solar hardware.

* Dynamic prompt builder for LangChain.

* Proposal generation using GPT-4-turbo with panel savings and visuals.

* Admin-level AI prompt configuration and enrichment.

### **Mobile App (Technician)**

* Offline job access and data sync.

* Job photo uploads with notes.

* Job status updates and submission.

* Local cache with IndexedDB.

### **Reporting & Billing**

* Usage dashboard with quote and job metrics.

* Billing plan management and invoice downloads.

* CSV export of client/job data.

### **Notification Engine**

* Lead alerts for admins.

* Job reminders for technicians.

* Automated quote follow-up via email/SMS.

---

## **6\. Functional Requirements**

* User authentication via Firebase.

* CRM must support create/edit/search for leads, jobs, clients, and products.

* Proposals generated using user inputs and database records.

* Offline mobile support with automatic syncing.

* Mobile functionality for job updates, photo capture, and status changes.

* Admin dashboard for lead management, quotes, and follow-up.

* Admin control over AI prompt logic.

* Event-driven notifications across channels.

---

## **7\. Non-Functional Requirements**

* ≥ 99.5% uptime during business hours.

* Mobile app response times ≤ 1 second.

* RBAC-based Firebase security rules.

* Compliance with South African data protection laws.

* Firebase scalability for MVP iteration and regional growth.

---

## **8\. Technical Architecture Overview**

**Platform Structure:**  
 Modular Firebase-based SaaS with integrated AI services and an offline-first mobile companion.

### **Tech Stack**

* **Web Admin Portal:** React \+ Tailwind.

* **Mobile App:** React Native (Expo) with IndexedDB and Firebase sync.

* **Backend:** Firebase Functions (Node.js).

* **Auth & DB:** Firebase Auth \+ Firestore.

* **AI Services:** OpenAI, LangChain.

* **Hosting:** Firebase Hosting.

### **AI Differentiator – HelioSense**

* Converts project data to professional solar proposals using structured prompts.

* Lifecycle includes input preprocessing, dynamic prompt creation, LLM invocation, post-processing (HTML to PDF), and audit logging.

* Token budgeting ensures predictable cost control.

### **Security Model**

* Firebase RBAC security rules.

* Scoped Firestore access per user role.

* Client-side and cloud function data validation.

---

## **9\. User Flows / Use Cases**

* **Admin Creates Client & Sends Proposal:** Creates client, selects products, uses AI to generate and send a proposal.

* **Technician Logs Job Updates (Offline):** Updates job info, adds photos, and syncs when online.

* **Admin Follows Up on Stale Leads:** Uses filters to identify inactive leads and triggers follow-up workflows.

* **Owner Views Billing & Usage:** Reviews account activity, usage metrics, and manages subscriptions.

---

## **10\. Success Metrics**

* Onboard 10+ installers in the first 3 months.

* Convert 20% of waitlist users to paying customers.

* ≥ 75% of users send proposals within 7 days.

* Stable MVP deployment on Firebase.

* Each pilot installer sends at least 3 proposals.

* Mobile covers ≥ 80% of desktop task functionality.

* Reach $500k ARR by 2027\.

---

## **11\. Risks and Assumptions**

### **Key Risks & Mitigations**

* **Slow SME adoption:** Offset with early pilots and hands-on onboarding.

* **AI errors in proposals:** Controlled via manual overrides and review workflows.

* **Offline sync failures:** Managed via IndexedDB and retry mechanisms.

* **AI cost escalation:** Controlled through tiering, caching, and async processing.

* **Compliance gaps:** Addressed through SA Firebase region selection and encryption.

### **Assumptions**

* Solar SMEs are digitally underserved but mobile-ready.

* Field conditions often lack consistent data coverage.

* Admins are moderately tech-savvy.

* Quote formats will follow SANS/SABS norms.

---

## **12\. Quality Assurance and Testing**

### **Test Layers**

* **Unit Tests:** ≥ 80% coverage on key backend functions using Vitest/Jest.

* **Integration Tests:** Validate frontend → function → database flows using Playwright, Expo E2E Driver, and Firebase Emulator.

* **Manual QA:** End-to-end persona-based testing for Admin, Tech, and Owner roles.

### **CI/CD Workflow**

* GitHub Actions run linting, unit tests, and integration tests on each pull request.

* All CI checks must pass for main branch merges.

### **Security Testing**

* Firebase role-based access rules tested using @firebase/rules-unit-testing.

* Simulated permission-switching and attack scenarios.

### **QA Readiness Checklist**

* Covers test coverage, security verification, documentation, and release checks.

---

## **13\. Release Plan and Timeline**

* **Internal Alpha:** August 2025

* **Pilot Launch:** September–October 2025 (3 live installers)

* **MVP Launch:** November 2025 (App store release, billing live)

* **Paid Tiers Launch:** Q1 2026

* **Globalization:** Q1 2026 (i18n, Stripe USD/MXN)

* **South Africa Expansion:** Target 100 paying users

* **Full AI Rollout:** Platform readiness for Series A funding

