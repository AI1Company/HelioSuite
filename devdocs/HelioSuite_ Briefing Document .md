# HelioSuite: AI-Powered Solar Operations Platform \- Briefing Document

## 1\. Executive Summary

HelioSuite is an AI-powered SaaS platform designed to streamline operations for solar installation companies. It aims to replace fragmented manual processes (Excel, WhatsApp, paper) with an integrated suite encompassing CRM, AI-generated proposals, offline-capable mobile field operations, and billing. The initial market focus is South Africa, targeting over 2,000 small-to-mid solar installers, with plans for global scalability, particularly in emerging markets like LATAM and APAC. The platform leverages a Firebase-based architecture, React/React Native, and an OpenAI/LangChain AI engine (HelioSense) to deliver a mobile-first, localised, and efficient solution. HelioSuite is seeking a $600,000 seed round to fund development, mobile rollout, and go-to-market operations, aiming for $500k ARR by 2027\.

## 2\. Core Vision and Mission

HelioSuite's vision is to "Empower every solar installation business—from startups to enterprises—to operate with intelligence, efficiency, and transparency through a unified, AI-powered platform." The mission is "To build the most reliable, all-in-one operational platform for solar SMEs in emerging markets—equipped with AI, offline-first mobile tools, and industry-specific workflows."  
Key strategic objectives include:

* Simplifying quoting, scheduling, and customer communication.  
* Localising for South African and other emerging-market contexts.  
* Using AI to reduce turnaround time for proposals.  
* Scaling via modular architecture and affordable pricing.

## 3\. Problem and Solution

### 3.1. The Problem

Solar installers, especially in emerging markets, suffer from:

* Fragmented tools: "patchwork of WhatsApp, PDFs, email, spreadsheets, and phone calls."  
* Lack of centralisation, leading to "missed follow-ups or lost leads."  
* Slow proposal generation, which "cost\[s\] sales."  
* Poor on-site record-keeping.

### 3.2. The Solution

HelioSuite offers an "end-to-end SaaS platform" that includes:

* CRM: With AI-generated proposals for lead management and pipeline tracking.  
* Mobile App: An "offline-first job/task access for field techs" to facilitate on-site work and data capture.  
* AI Automation: "AI follow-up \+ summary generation" and "LLM-powered automation engine (HelioSense) generates localized content in real time."  
* Financial Tools: "Invoice \+ VAT handling w/ Stripe."  
* Admin Dashboard: For "analytics, logs, permissions."

## 4\. Market Opportunity and Go-to-Market Strategy

### 4.1. Market

* Initial Focus: South Africa, with "2,000+ small-to-mid solar installers." The market is "underserved" due to load shedding and rapid solar adoption.  
* Global Scalability: The platform is designed to be "multilingual, mobile-first, and compliant with local financial/taxation requirements, making it globally scalable" to regions like LATAM, Africa, and APAC.  
* TAM: Global solar installation market \> $400B, with over 200,000 solar SMEs worldwide.  
* SOM: Targeting 100 SA installer teams in Year 1, with a potential ARR per customer of $500–2,000.

### 4.2. Go-to-Market Strategy

* Direct sales to installer networks (e.g., SAEA).  
* Partnering with component suppliers and solar training centres.  
* "Localized onboarding for en-ZA, es-MX."  
* Content marketing, including YouTube demos and AI use case reels.

## 5\. Key Features and AI Differentiation

### 5.1. Key Features (v1.0)

HelioSuite's core modules and features are tiered across Starter, Pro, and Enterprise plans:

* CRM & Admin Dashboard: Lead management, job scheduling, customer profiles, team task tracking.  
* AI Proposal Generator: Converts project data into PDF proposals. Includes "Product Selection Engine," "Dynamic Prompt Builder," and "Proposal Generation (OpenAI)." Pro tier offers "AI Prompt Editing (Admin)."  
* Mobile App (Technician): "Offline Sync," "Job Image Upload," "Job Completion Submit."  
* Reporting & Billing: "Usage Dashboard," "Billing & Subscription Management," "Export Reports (CSV)" (Enterprise).  
* Notification Engine: New lead notifications, job due reminders, quote follow-up workflow (Pro).

### 5.2. AI Differentiator (HelioSense)

AI is a "core differentiator and value driver."

* AI Proposal Generation: "Converts project data into ready-to-share solar proposals (PDF)." Uses "structured prompts \+ LangChain \+ GPT-4-turbo."  
* Input Data Enrichment: "Translates minimal inputs into complete proposal content," auto-completing assumptions like panel type and layout.  
* Language Localisation (planned): Ability to "Translate proposal text into Afrikaans, Zulu, and other languages."  
* AI Lifecycle: Involves user input, preprocessor, prompt builder, LLM request (LangChain with retries \+ fallback), response post-processing (text to HTML → PDF), and audit logging.  
* Prompt Engineering: Uses a fixed "System Prompt" (e.g., "You are a solar consultant generating customer proposals. Your output must be: \- Clear and professional \- Localized to South African context \- Accurate based on input data") and dynamic "User Prompt" based on user inputs.

## 6\. Architecture and Tech Stack

### 6.1. High-Level Architecture

HelioSuite is a "modular, Firebase-based SaaS application with an offline-first mobile companion and integrated AI services for proposal generation."

* Web Dashboard interacts with Firebase (Auth, DB).  
* Mobile App (Field) interacts with Firestore (Offline).  
* AI Proposal Engine uses Cloud Functions that interface with OpenAI / LangChain.

### 6.2. Tech Stack

* Frontend (Web): React \+ Tailwind  
* Mobile App: React Native (Expo)  
* Backend Logic: Firebase Functions (Node)  
* Auth & DB: Firebase Auth \+ Firestore  
* AI Services: OpenAI / LangChain  
* Hosting: Firebase Hosting

### 6.3. Firebase Specifics

* Authentication: Firebase Auth with custom claims for RBAC (admin, technician, owner).  
* Firestore DB: Stores CRM, jobs, proposals, and logs. Key collections include /users, /clients, /jobs, /products, /proposals.  
* Firebase Storage: Used for "Job site photo uploads (mobile)" and "Proposal PDFs."  
* Cloud Functions: Act as the "AI Proposal Engine," trigger notifications, and log errors.  
* Offline Support: Mobile app writes to an IndexedDB queue, with a flushQueue() function syncing jobs on reconnect, reconciled by job.updatedAt.

### 6.4. Security

* Firebase Security Rules with RBAC (Role-Based Access Control) are crucial.  
* "Scoped Firestore access by role (Owner, Sales, Tech)."  
* "Data validation in client and cloud functions."  
* "Technicians can only write to jobs assigned to them."

## 7\. Development and Operations

### 7.1. Folder Structure

The codebase follows a monorepo structure:

* /web-admin: React web app.  
* /mobile-app: React Native app.  
* /functions: Firebase Cloud Functions (AI, auth triggers, sync monitor).  
* /shared: Shared utilities, models, types.

Documentation is organised by project lifecycle phases, including project-foundation/, requirements/, design/, development/, qa/, project-management/, deployment-support/, and post-release/.

### 7.2. Coding Guidelines

* Frontend: Functional components and hooks, TailwindCSS (web), StyleSheet API (mobile), group features into modules.  
* Firebase Functions: Modular files, input validation, logging context, try/catch for API calls, TypeScript.  
* Testing: Playwright (web), Expo test tools (mobile), unit tests for business logic, linting and type-checking.

### 7.3. CI/CD Workflow

HelioSuite uses GitHub Actions for CI/CD:

* Triggers on every push to main or PR to main.  
* Steps include installing dependencies, linting, testing, deploying Firebase functions and hosting.  
* Secrets (FIREBASE\_TOKEN, OPENAI\_API\_KEY) are managed via GitHub Secrets.  
* "All builds must pass CI checks before merging to main."

### 7.4. Testing Strategy

* Unit Tests: For functions, utility modules, services (Jest/Vitest).  
* Integration Tests: Verifying communication between modules (e.g., "frontend → function → DB"), using Firebase Emulator Suite and Playwright/Expo E2E Driver.  
* Manual QA: End-to-end flows across mobile \+ web on staging environment.  
* Coverage Targets: ≥ 80% unit test coverage for critical modules, 100% CI pass rate, manual QA signoff.  
* "All rule changes must be tested before deployment."

## 8\. Financial Projections and Funding Ask

### 8.1. Business Model

HelioSuite offers a tiered pricing model:

* Starter: Free (10 AI calls).  
* Pro: R799/month (\~$49/month), 100 AI calls.  
* Enterprise: Custom pricing, unlimited AI calls.  
* "Stripe billing (ZAR, USD, future MXN)." "Usage-based AI pricing model in Enterprise."

### 8.2. Revenue Forecast (Conservative)

* 2025: 100 Monthly Active Installers, R79,900 MRR, \~$50,000 ARR.  
* 2026: 350 Monthly Active Installers, R279,000 MRR, \~$170,000 ARR.  
* 2027: 1,000 Monthly Active Installers, R799,000 MRR, \~$500,000 ARR.  
* 2028: 2,000 Monthly Active Installers, R1.6M MRR, \~$1.1M ARR.

### 8.3. Unit Economics (Pro Plan)

* ARPU: R799  
* Gross Margin (SaaS infra): \~85%  
* CAC (est. via direct sales): R1,400 (\~$75)  
* LTV (2.5 yrs avg retention): R23,970 (\~$1,300)  
* LTV : CAC Ratio: \~17x

### 8.4. Cost Structure (Monthly ZAR)

* Firebase/Infra: R8,500  
* OpenAI API: R12,000  
* Salaries (5 FTE): R320,000  
* Sales & GTM: R40,000  
* Misc Ops/Admin: R15,000

### 8.5. Funding Ask

* Goal: $600,000 Seed Round (SAFE).  
* Runway: \~14–16 months.  
* Use of Funds:  
* AI Infrastructure: $120,000  
* Mobile Dev Hiring: $150,000  
* GTM & Ops: $180,000  
* Founder \+ Buffer: $150,000

## 9\. Traction and Roadmap

### 9.1. Traction

* "MVP built: Firebase, LangChain, mobile app."  
* "15 installer LOIs secured for pilot."  
* "50+ waitlist signups via early landing page."

### 9.2. Timeline

* Internal Alpha: Aug 2025  
* Pilot Launch: Sep–Oct 2025 (3 installers in production)  
* MVP Launch: Nov 2025 (App stores live, billing enabled)  
* Globalization: Q1 2026 (i18n support, Stripe USD/MXN)  
* Revenue goal: $500k ARR by 2027

## 10\. Team and Exit Strategy

### 10.1. Team

* Founder/CEO: "Former solar installer \+ SaaS product designer."  
* CTO: "Firebase veteran, mobile+cloud systems engineer."  
* AI Lead: "LLM \+ prompt engineering specialist (LangChain, GPT)."  
* Advisors: Solar business consultants, energy SaaS investor.

### 10.2. Risks & Mitigation

Key risks include slow SME adoption ("Pilot with early adopters, personalized onboarding"), AI model inaccuracies ("Rule-based overrides, manual edit before send"), and scaling costs of AI APIs ("Usage tiering, caching, async processing").

### 10.3. Exit Strategy

Potential exit strategies include:

* SaaS acquisition by a global solar player (e.g., Enphase, SunRun, Aurora Solar).  
* Strategic M\&A with CRMs or field service platforms (e.g., Zoho, ServiceTitan).  
* Potential regional roll-ups (LATAM, Africa) or IPO path.

