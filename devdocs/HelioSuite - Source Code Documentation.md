# **HelioSuite**

### **Source Code Documentation**

---

## **1\. Overall Repository Structure**

The HelioSuite codebase follows a monorepo structure under the root directory `helio-suite/`, supporting web, mobile, and backend development with clean modularisation.

### **Key Root Files and Directories**

* `README.md`: Overview of the platform for developers and contributors.

* `CONTRIBUTING.md`: Contribution guidelines, onboarding steps, PR rules.

* `LICENSE.md`: MIT License © 2025 HelioSuite.

* `.github/`: GitHub Actions workflows

  * `ci.yml`: Continuous Integration

  * `deploy.yml`: Deployment pipeline

* `docs/`: Structured product documentation across lifecycle phases:

  * `overview/`, `requirements/`, `design/`, `development/`, `testing/`, `release/`, `investor/`, `guides/`

---

## **2\. Codebase Folder Structure**

The source code is organised within `/src` and spans three main areas:

### **/web – *Web Frontend (Admin Portal)***

* `src/components/`: Shared UI components

* `src/pages/`: Route-level views (e.g., CRM, Dashboard)

* `src/features/`: Domain logic modules (e.g., Jobs, Proposals)

* `src/hooks/`: Custom React hooks

* `src/services/`: Firebase/API integrations

* `src/styles/`: Tailwind and custom CSS

* `public/`: Static assets

### **/mobile – *Mobile App (Technicians)***

* `src/screens/`: Job views, photo uploads, offline sync

* `src/components/`: Reusable UI elements

* `src/storage/`: AsyncStorage and IndexedDB queuing logic

* `src/api/`: Firebase sync wrappers

* `src/context/`: Auth and role management

### **/firebase – *Backend Logic (Cloud Functions)***

* `functions/index.js`: Entry point for all functions

* `functions/aiProposal.js`: LangChain \+ OpenAI integration

* `functions/validators.js`: Input checks

* `functions/authTriggers.ts`: Signup/login event handling

* `functions/syncMonitor.ts`: Logs and queue health

* `firestore.rules`: Firestore access control

* `firestore.indexes.json`: Firestore indexing configuration

### **Other Directories**

* `/shared/`: Shared models, utility functions, and types

* Configuration: `.env.example`, `firebase.json`, `package.json`

---

## **3\. Coding Standards & Guidelines**

### **Frontend (Web/Mobile)**

* Use functional components with hooks (no class components)

* **Web:** TailwindCSS

* **Mobile:** React Native's StyleSheet API

* Feature-based folder structure under `/features/`

* Naming conventions:

  * Components: `PascalCase` (e.g., `CustomerCard.tsx`)

  * Hooks: `useCamelCase`

  * Files: `camelCase.ts`

  * Folders: `kebab-case/`

### **Firebase Functions**

* Modular architecture per function

* Written in TypeScript

* Validate inputs at all layers

* Contextual logging (e.g., user ID, action source)

* Catch errors and return structured JSON responses

* Use `firebase deploy --only functions` for scoped updates

* Monitor logs with `firebase functions:log`

### **Documentation & PR Workflow**

* Use JSDoc for all exported functions

* Inline comments for complex logic

* Descriptive branch names (e.g., `feature/job-tracking`)

* PRs:

  * Require lint/type-check/test passes

  * Must link to a Notion ticket

  * Use labels (e.g., `frontend`, `AI`, `infra`)

---

## **4\. Build & Deployment Instructions**

### **Prerequisites**

* Node.js v18+

* Yarn v1.22+

* Firebase CLI

* Expo CLI

* GitHub credentials

### **Local Development**

git clone https://github.com/heliosuite/heliosuite.git  
cd heliosuite  
yarn install  
firebase login && expo login  
firebase use \--add

* Start web dev server: `cd web && yarn dev`

* Start mobile app: `cd mobile && expo start`

* Emulate Firebase: `firebase emulators:start`

### **Production Deployment**

* **Web:**  
   `cd web-admin && npm run build && firebase deploy --only hosting:web-admin`

* **Mobile:**  
   `cd mobile-app && npx expo build:android` or `ios`

* **Functions:**  
   `cd functions && firebase deploy --only functions`

### **CI/CD (GitHub Actions)**

* **ci.yml**: Installs dependencies, runs tests/lint

* **deploy.yml**: Deploys Firebase resources

* Uses GitHub Secrets for `FIREBASE_TOKEN`, `OPENAI_API_KEY`

* PRs must originate from `dev` and merge into `main`

* All tests must pass before merging

---

## **5\. Testing Strategy**

### **Unit Testing**

* Tools: `vitest`, `jest`, Firebase Emulator

* Scope:

  * Frontend: Field validation, status badges, auth guards

  * Backend: Prompt builders, formatters, access validators

  * Mobile: Offline queue manager, sync handlers

* Test coverage goal: ≥ 80% for critical modules

* File structure: `/__tests__/moduleName.test.ts`

### **Integration Testing**

* Tools: Playwright (web), Expo E2E Driver (mobile), Firebase Emulator

* Scope:

  * End-to-end proposal flow (input → prompt → PDF → Firestore)

  * Job status sync (mobile → web)

  * Permissions (e.g., Sales can't access logs)

* Uses mock LLMs and seeded Firestore state

### **Manual QA**

* Performed pre-release on both platforms

* Verifies:

  * Role restrictions

  * Proposal logic

  * Mobile sync functionality

* Tools: Expo test builds, dummy data, Firebase emulators

### **CI Pipeline**

* Commands:

  * `npm run lint`

  * `npm run test`

  * `firebase emulators:exec` (integration testing)

* Pre-commit hook enforces `yarn test` locally

---

## **6\. AI Feature Documentation**

### **Key Capabilities**

* Generate PDF solar proposals using AI

* Translate minimal input into rich content

* Includes visuals, savings analysis, panel data

### **AI Lifecycle**

1. **User Input**

2. **Preprocessor** (field validation)

3. **Prompt Builder**

4. **LLM Request** (via LangChain → GPT-4-turbo)

5. **Response Post-Processing** (HTML → PDF)

6. **Audit Logging** (token usage \+ logs)

### **Prompt Engineering**

* **System Prompt:** Static tone, purpose ("You are a solar consultant...")

* **User Prompt:** Dynamic (customer name, site info, system specs)

* All prompts versioned and tested for consistency

### **Token Budgeting**

* \~2,100 tokens/proposal

* Limit: $0.10 per proposal

* Enforced via Firebase claims by tier:

  * **Starter:** 15 proposals/month

  * **Pro:** 100 proposals/month

  * **Enterprise:** Unlimited

### **Planned Features**

* Language localisation: Afrikaans, Zulu, etc.

* Persona tuning: Different prompt structures for SME, Enterprise

---

## **7\. Firebase Architecture**

### **Core Components**

* **Firebase Auth:**

  * Role-based access via Custom Claims

  * Sign-in: Email/password only

* **Firestore Database:**

  * Real-time NoSQL storage

  * Example collections:

    * `/users/{uid}`

    * `/customers/{cid}`

    * `/jobs/{jid}`

    * `/proposals/{pid}`

    * `/products/{id}`

* **Cloud Functions:**

  * Proposal generation: `generateProposal()`

  * Sync error logging: `logSyncError()`

  * Notifications: `sendNotif()`

* **Firebase Hosting:** Hosts the Web Dashboard

* **Firebase Storage:** Stores photos and generated PDFs

### **Offline Support**

* IndexedDB queue on mobile app

* `flushQueue()` syncs when online

* Conflict resolution using `job.updatedAt`

### **Security & RBAC**

* Firestore Rules enforce scoped access by role

* Example:

  * Technicians can only read/write to assigned jobs

  * Storage: Only uploader can modify files

### **Scaling Strategy**

* Start: Single Firebase project for MVP

* Future: Multi-region Firebase projects

* Monitoring:

  * GCP dashboards for quota

  * Composite indexes for search

* Cost control:

  * Tiered AI limits

  * Token budgeting

  * Caching and proposal caps

