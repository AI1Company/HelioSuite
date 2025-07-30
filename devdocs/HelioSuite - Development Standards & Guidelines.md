# **HelioSuite**

### **Development Standards & Guidelines**

---

HelioSuite follows a rigorous set of standards across engineering, testing, deployment, security, and documentation to ensure high-quality delivery, maintainability, and scale.

---

## **1\. Coding Standards & Guidelines**

### **Frontend (React & React Native)**

* Use **functional components and hooks**; avoid class components.

* Style with **TailwindCSS** (web) and **StyleSheet API** (mobile).

* Group features by domain (e.g., `/features/crm`, `/features/jobs`).

* Use **custom hooks** for reusable logic.

* Avoid Redux in v1; rely on `useState`, `useReducer`, and `useContext`.

* Validate all forms **client-side**.

* Place shared UI components in `/components`.

* **Naming conventions**:

  * Components: `PascalCase` (e.g., `CustomerCard.tsx`)

  * Hooks: `camelCase` (e.g., `useJobStatus.ts`)

  * Files/folders: `kebab-case`

### **Backend (Firebase Functions – Node.js / TypeScript)**

* Modular file structure: one function per file (e.g., `aiProposal.js`, `jobUpdate.js`)

* Validate all inputs before database writes.

* Include **contextual logging** (e.g., user ID, function name).

* Wrap all API calls with `try/catch`; return **structured errors**.

* Return consistent `res.status(x).json(...)` responses.

* Enforce user token validation on all triggers.

* Use `/shared` for utility helpers.

### **Code Documentation**

* Use **JSDoc** for all exported functions.

* Inline comments required for complex logic, especially Firebase or LangChain flows.

### **Git & PR Workflow**

* Use descriptive branch names (e.g., `feature/job-tracking`)

* All PRs must:

  * Include a clear description and linked Notion ticket

  * Use appropriate PR labels (e.g., `frontend`, `backend`, `AI`)

  * Pass linting, type checks, and pre-push hooks

  * Be reviewed and flagged if risky or unclear

---

## **2\. Testing & Quality Assurance (QA)**

### **Testing Layers**

* **Unit Tests**

  * Scope: components, logic, services, and Firebase functions

  * Tools: `vitest`, `jest`

  * Target: ≥ 80% coverage

  * Location: `/__tests__/moduleName.test.ts`

* **Integration Tests**

  * Tooling: `Playwright`, `Expo E2E Driver`, `Firebase Emulator`

  * Scenarios: Proposal flow, job sync, permissions

* **Manual QA**

  * Tools: Expo test builds, Firebase emulator

  * Use pre-defined flows: login → lead → proposal → job

  * Sign-off required from QA Lead, Tech Lead, Product Manager

### **CI Pipeline (GitHub Actions)**

* Trigger: push/PR to `main`

* Tasks: `lint`, `test`, deploy Firebase functions & hosting

* Integration tests run via Firebase emulators

* 100% CI pass required for merging

* Secrets managed via GitHub (`FIREBASE_TOKEN`, `OPENAI_API_KEY`)

### **Release QA Checklist**

* ≥ 80% unit test coverage

* Manual testing for offline flows

* Cross-device tests (iOS, Android, Chrome)

* Accurate staging dataset

* Firebase rules tested per role

* Verified documentation and configs

* Green CI, TestFlight uploads, clean function deploys

* Regression tests: CRM, AI generation, job sync, photo uploads, notifications

---

## **3\. Deployment Standards**

* **Tooling**: Firebase, Expo, GitHub Actions

* **Prerequisites**: Node.js (v18+), Yarn (1.22+), Firebase CLI, Expo CLI

* **Firebase Deployment**:

  * Web admin: Firebase Hosting

  * Functions: `firebase deploy --only functions`

  * Assets: Firebase Storage

* **Mobile Builds**:

  * `npx expo build:android`

  * `npx expo build:ios`

* **CI/CD Process**:

  * Trigger: push/PR to `main`

  * Steps: install → lint → test → deploy → notify

---

## **4\. Security Standards & Permissions (RBAC)**

### **User Roles**

* **Owner**: Full CRM, proposals, analytics, team, billing

* **Sales Rep/Admin**: Customers, leads, user management, proposals

* **Technician**: Assigned jobs only; mobile access, status updates

* **Guest**: No CRM access

### **Enforcement**

* Firebase Auth \+ custom claims

* Role-scoped Firestore & Storage rules

* Admins can read/write; technicians limited to assigned jobs

* Upload restrictions: Only uploader can modify/delete assets

### **Compliance**

* Passwords: Firebase Auth

* Encryption: Data encrypted at rest and in transit

* Upload Scope: Job and user ID

* Access logs via Firestore listeners

* Billing and exports restricted to Admin role

---

## **5\. AI & Prompt Engineering Standards**

### **Prompt Structure**

* **System Prompt**: Fixed, sets assistant role (e.g., solar consultant, professional tone)

* **User Prompt**: Dynamic, based on CRM input (location, usage, roof type)

### **Prompt Workflow**

Input Form → Prompt Builder (LangChain) → LLM API (GPT-4) → Markdown → HTML → PDF

### **Prompt QA & Budgeting**

* Weekly regression tests for consistency

* Edge case handling (e.g., no roof type)

* **Token cost targeting**: \<$0.10/proposal

* Tier limits:

  * Starter: 15/month

  * Pro: 100/month

  * Enterprise: Unlimited (monitored)

* Abuse prevention:

  * Usage logged per proposal

  * Alerts for abnormal token use

---

## **6\. Documentation Standards**

### **Structure**

* Based on **ReadySET Pro** framework

* Folders by lifecycle:  
   `project-foundation`, `requirements`, `design`, `development`, `qa`, `deployment-support`, `post-release`

### **Contribution Guidelines**

* Detailed in `CONTRIBUTING.md`

* Covers forks, semantic commits, PR process

### **Style & Review**

* Clear headings, bullets, code blocks as needed

* Internal links where helpful

* Professional, technical tone

* PRs for docs are linted and CI-checked

### **Notion Workspace**

* Mirrors GitHub docs

* Tagged and filterable by lifecycle stage and function (e.g., \#design, \#ai, \#v1.0)

