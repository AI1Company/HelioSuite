# **HelioSuite**

### **QA & Testing Strategy**

*Comprehensive Software Quality Assurance Across Platform Lifecycle*

---

## **1\. Overall QA Approach**

HelioSuite’s quality assurance (QA) strategy integrates multiple test layers, continuous integration workflows, distinct test environments, and stringent coverage goals to ensure reliability, security, and high performance across all platform components.

* **Manual QA** is performed at every release milestone.

* Tracked via a dedicated **QA board in Notion**.

* **QA Readiness Checklist** is reviewed and signed off by:

  * QA Lead

  * Tech Lead

  * Product Manager

---

## **2\. Test Layers**

### **Unit Tests**

* **Scope:**  
   Focuses on individual logic units:

  * CRM form validation

  * Proposal input handlers

  * Token calculation logic

  * Offline queue manager

* **Tools:**  
   `vitest` or `jest` for frontend (React / React Native) and backend (Firebase Functions).  
   Firestore Emulator is used as a local test DB.  
   AI interactions are mocked for verification.

* **Location:**  
   `/__tests__/moduleName.test.ts`

* **Requirements:**

  * All modules must ship with unit tests.

  * ≥ 80% coverage for backend Cloud Functions.

---

### **Integration Tests**

* **Scope:**  
   Tests communication between modules:

  * Frontend ↔ Cloud Functions ↔ Firestore

  * Workflow regressions (e.g., Quote → Job → Sync)

  * API triggers, Firebase rules, Firestore & Storage interactions

* **Tooling:**

  * `Playwright` for end-to-end web tests

  * `Expo E2E Driver` for mobile simulation

  * `Firebase Emulator Suite` for backend testing

* **Key Flows Tested:**

  * **Proposal Flow:** Input → Prompt → GPT → PDF → Firestore

  * **Job Sync:** Create job on web → sync to mobile → offline edit → sync back

  * **Role Permissions:** Ensure access is scoped per role

* **Environment:**  
   Tests are run in **staging** with:

  * Mock LLM

  * Seeded Firestore states for reproducibility

---

### **Manual QA**

* **Scope:**  
   End-to-end testing of:

  * Mobile and Web apps

  * Proposal logic

  * Role-based user flows

* **Tools:**

  * Expo test builds

  * Firebase Emulator with seeded dummy data

* **Test Cases Include:**

  * CRM (create/edit customers)

  * Proposal Generation (PDF, validations)

  * Job Tracking (assign jobs, offline sync)

  * Role-Based Access (e.g., Technician restricted from CRM)

* **Additional Checks:**

  * All offline mobile flows

  * Cross-device testing (iOS, Android, Chrome desktop)

---

## **3\. CI/CD Pipeline**

HelioSuite leverages **GitHub Actions** for automated QA and deployment.

* **Trigger:**  
   On every push or PR to `main`

* **Pipeline Steps:**

  * Install dependencies

  * Run `npm run lint`

  * Run `npm run test`

  * Run `firebase emulators:exec` for integration tests

  * Deploy Firebase Functions & Hosting

* **Merge Requirements:**

  * All builds must pass

  * CI checks must be green

  * PR must be reviewed and approved

---

## **4\. Test Environments**

| Environment | Purpose | Notes |
| ----- | ----- | ----- |
| `dev` | Active feature development | Local only; seeded via script |
| `staging` | Internal QA & pre-release | Firebase hosted; password-protected |
| `prod` | Live production for customers | Updated post-merge to `main` |

---

## **5\. Test Data & Fixtures**

* **CRM, Products, and Users:**  
   Stored in `/__fixtures__`

* **Image Mocks:**  
   Used for mobile job photo tests

* **LangChain Mocks:**  
   Simulate prompt/response for AI test coverage

---

## **6\. Coverage Targets**

| Category | Target |
| ----- | ----- |
| Unit Test Coverage | ≥ 80% (critical modules) |
| CI Pass Rate | 100% |
| Manual QA Sign-Off | Required for release |

*   
  Example: **v1.0.0 achieved 91% backend unit test coverage**

* Manual QA signoff includes:

  * CRM create/edit/delete

  * AI generation tested on latest deploy

  * Job sync and photo updates verified

---

## **7\. Security Testing**

* **Objective:** Prevent unauthorized access and enforce role-based least privilege

* **Tools:**

  * `@firebase/rules-unit-testing`

  * Firestore Emulator Suite

  * `jest`

* **Test Matrix (Examples):**

| Role | Read/Write Access |
| ----- | ----- |
| Owner | All modules |
| Sales Rep | Customers, proposals only |
| Technician | Assigned jobs only |

*   
  **Security Validations:**

  * Technicians blocked from CRM

  * Sales cannot access logs or admin routes

---

## **8\. Post-Release Learning**

* A **Postmortem Template** is required after every production release.

* **Timeline:** Must be completed within **5 days post-release**

* **Contents:**

  * Summary of issues

  * Resolutions and learnings

  * Action items with ownership

