# **HelioSuite**

### **Strategic Development Plan**

*A Structured Approach to Product Launch, Growth & Scalability*

---

## **1\. Plans**

### **Product Vision & Scope**

HelioSuite is an AI-powered SaaS platform designed for solar installation businesses to streamline operations—lead tracking, proposal generation, fieldwork, and billing.

* **Vision:** Empower solar SMEs in emerging markets with intelligence, efficiency, and transparency through a unified, AI-first platform.

* **Mission:** Build the most reliable, all-in-one operational platform tailored for solar businesses.

* **Core Strategic Objectives:**

  * Simplify quoting, scheduling, and customer communication.

  * Localise features and UI for South Africa and other emerging markets.

  * Reduce proposal turnaround time using AI.

  * Ensure scalability via modular architecture and affordable pricing.

* **v1 Features:**

  * CRM for leads, jobs, customers, product library.

  * AI Proposal Generator (LangChain \+ OpenAI \+ Firestore).

  * Mobile app for field technician workflows (offline-first).

  * Project dashboard (timeline, invoicing, job status).

  * Admin portal for quote and client management.

* **Out of Scope for v1:**

  * Full CAD/3D design integrations.

  * Solar component marketplace.

  * Advanced billing integrations (planned for v2).

* **Constraints:**

  * Firebase-only stack.

  * Offline-first mobile requirements.

  * South Africa–focused v1, English-only UI.

---

### **Architecture & Tech Stack**

A modular Firebase architecture underpins HelioSuite’s scalable design.

* **Primary Components:**

  * **Web Admin Portal**: Built in ReactJS (CRM, quoting, analytics).

  * **Mobile App**: React Native (offline-first job access).

  * **Backend & Infra**: Firebase Functions, Firestore, Auth, Storage.

  * **AI Layer**: LangChain \+ OpenAI (GPT-4-turbo).

* **Data Flow:**

  * Users authenticate via Firebase Auth.

  * Data written to Firestore (CRM, proposals, jobs).

  * Proposal generation via Cloud Functions.

  * Mobile app logs and syncs data when reconnected.

* **Security & RBAC:**

  * Firebase Security Rules \+ custom claims.

  * **Roles:**

    * **Technician:** Read/write only assigned jobs.

    * **Admin:** Full Firestore access.

    * **Owner:** Read-only CRM access \+ billing.

---

### **AI/Prompt Engineering**

HelioSuite’s AI layer (HelioSense) automates solar proposal creation.

* **Prompt Templates:**

  * **System Prompt:** Defines AI’s persona (solar consultant, accurate, localised).

  * **User Prompt:** Dynamic, built from form inputs (location, usage, roof type).

* **Prompt Flow:**

  * Form input → Prompt Builder (LangChain) → LLM API (GPT-4) → Markdown → HTML → PDF.

* **AI Differentiators:**

  * Locale-specific templates (e.g., ZAR, en-ZA, es-MX).

  * Proposal-to-summary/email/invoice conversion.

  * Proposal memory via vector embeddings.

---

### **Go-To-Market Strategy**

Focused initially on South Africa, with scalable global expansion plans.

* **Initial Focus:**

  * 2,000+ small-to-mid solar installers (South Africa).

* **Expansion Strategy:**

  * Direct installer sales.

  * Partnerships with suppliers/training centres.

  * Localised onboarding (en-ZA, es-MX).

  * Content marketing: demo reels, AI explainer videos.

---

### **Documentation Standards**

Organised using the **ReadySET Pro** lifecycle format.

* **Structure:**

  * Phases: `project-foundation`, `requirements`, `design`, `development`, `qa`, `deployment-support`, `post-release`.

* **Contribution Process:**

  * Detailed in `CONTRIBUTING.md` (fork, PR, semantic commits).

* **Style Guide:**

  * Clear headings, bullets, technical tone, inline links, code snippets.

* **CI-Checked:** Documentation PRs are linted and tested on build.

---

## **2\. Estimates**

### **Financial Projections (2025–2028)**

| Year | ARR Estimate | Monthly Active Installers |
| ----- | ----- | ----- |
| 2025 | \~$50,000 | 100 |
| 2026 | \~$170,000 | 350 |
| 2027 | \~$500,000 | 1,000 |
| 2028 | \~$1.1M | 2,000 |

* **ARPU (Pro Tier):** R799/user/month

* **Gross Margin:** \~85%

* **CAC:** R1,400 (\~$75)

* **LTV:** R23,970 (\~$1,300) → **LTV:CAC Ratio**: \~17x

### **Monthly Cost Breakdown (ZAR)**

* Firebase / Infra: R8,500

* OpenAI API: R12,000

* Salaries (5 FTEs): R320,000

* Sales & GTM: R40,000

* Misc. Ops/Admin: R15,000  
   **→ Total Burn:** R395,000 (\~$21,000/month)

### **Funding & Runway**

* **Funding Ask:** $600,000 Seed (SAFE)

* **Use of Funds:**

  * AI Infra: \~$120k

  * Mobile Dev Hiring: \~$150k

  * GTM/Ops: \~$180k

  * Founders \+ Buffer: \~$150k

* **Runway:** \~14–16 months post-funding

---

### **AI Token Budgeting**

* **Target Cost:** \<$0.10 per proposal

* **Token Breakdown (avg):**

  * Prompt: \~500

  * LLM Response: \~1,500

  * Post-processing: \~100

  * **Total Cost:** \~$0.006–0.01 (buffer: $0.015)

* **Tier Limits:**

  * **Starter:** 15/month

  * **Pro:** 100/month

  * **Enterprise:** Unlimited (with monitoring)

* **Abuse Prevention:**

  * Quotas via Firebase custom claims

  * Token usage logs per user

  * Backend alerts for anomalies

---

## **3\. Schedules**

### **Product Roadmap**

| Milestone | Date / Phase |
| ----- | ----- |
| Internal Alpha | August 2025 |
| Pilot Launch | Sep–Oct 2025 (3 installers live) |
| MVP Launch | Nov–Dec 2025 |
| v1.0.0 "SolarGenesis" | 1st December 2025 |
| Paid Tiers Launch | Q1 2026 |
| Globalization (i18n) | Q1 2026 |
| $500k ARR Target | By 2027 |

---

### **Funding Tranches & Triggers**

* **$150,000:** MVP live, 3 pilot customers onboarded

* **$300,000:** Stripe billing \+ mobile app launch

* **$450,000:** South Africa expansion, 100 paid users

* **$600,000:** Full AI rollout, Series A prep

---

### **Deployment Schedule**

* **CI/CD via GitHub Actions**

  * Triggered on push or PR to `main`

  * Steps: Install → Lint → Test → Deploy Firebase Hosting & Functions

  * All builds must pass CI before merge

---

### **QA & Release Process**

* **Milestone-Based Manual QA:**

  * Repeated for each release

  * Tracked via Notion QA board

* **QA Readiness Checklist:**

  * ≥ 80% backend test coverage

  * All offline flows manually tested

  * Cross-device testing (iOS, Android, Chrome)

  * CI workflows green

  * Sign-off from QA Lead, Tech Lead, Product Manager

* **Post-Release Process:**

  * Postmortem completed within 5 days

  * Lessons \+ action items documented and assigned

