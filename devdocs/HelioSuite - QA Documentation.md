# **HelioSuite**

### **Quality Assurance (QA) Documentation**

---

## **1\. Overall Test Strategy and Approach**

HelioSuite adopts a layered quality assurance strategy to validate performance, security, and reliability across both the web and mobile platforms.

### **Test Layers**

* **Unit Tests:**  
   Validate individual functions, components, and logic in isolation.

* **Integration Tests:**  
   Ensure modules interact as expected (e.g., frontend ↔ backend ↔ database).

* **Manual QA:**  
   Simulates real user interactions across platforms using defined test scripts.

### **Tools Utilised**

* **Unit Testing:**  
   `vitest` or `jest` for React, React Native, and Cloud Functions.

* **Integration Testing:**  
   `Playwright` for end-to-end web testing  
   `Expo E2E Driver` for mobile simulations  
   `Firebase Emulator Suite` for Firestore, Auth, and Functions

* **Manual QA:**  
   Expo test builds and Firebase emulated environments with seeded data

* **Security Testing:**  
   `@firebase/rules-unit-testing` \+ `jest` with emulator support

### **Coverage Targets**

* ≥ 80% test coverage for all critical backend and frontend modules

* 100% CI pass rate required for merges to the main branch

* Manual QA signoff for mobile and web portals before release

---

## **2\. CI Test Integration Plan**

HelioSuite uses GitHub Actions for automated continuous integration and deployment processes.

### **CI Workflow (`ci.yml`)**

* **Trigger:** On every push or pull request

* **Steps:**

  * Install dependencies

  * Run linting (`npm run lint`)

  * Execute unit/integration tests (`npm run test`)

### **Deployment Workflow (`deploy.yml`)**

* **Trigger:** On push to `main`

* **Steps:**

  * Install dependencies

  * Lint and test

Deploy Firebase Functions and Hosting with:

 firebase deploy \--token $FIREBASE\_TOKEN

* 

### **CI Test Scope**

* Unit tests across modules: CRM, AI engine, mobile sync

* Integration tests from prompt generation to Firestore save

* Type checking and linting included in every PR check

### **Merge Requirements**

* All CI jobs must pass

* Reviewed and approved pull request

* Merges allowed only from `dev` → `main`

---

## **3\. Test Cases**

Test cases are categorised into functional, security, and AI-specific scenarios.

### **Functional Test Cases**

* **CRM & Admin Portal:**

  * Lead creation and conversion

  * Job search and filter

  * Assigning jobs to technicians

* **Proposal Generator:**

  * Triggering AI proposals

  * Handling input validation and API errors

  * Ensuring PDF accuracy with complete product specs

* **Mobile App (Technician):**

  * Offline job access

  * Job status updates and photo uploads

  * Syncing queues when reconnected

### **Security & Role-Based Test Cases**

* **Role Validation:**

  * Technician: Read-only access to assigned jobs

  * Admin: Manage user roles and permissions

  * Owner: Access to analytics, billing only

  * Guest: Blocked from all internal data routes

* **Access Enforcement:**

  * Firebase Security Rules verified via emulators

  * Admin cannot impersonate technician

  * Owner has no access to prompt configuration

### **Prompt QA**

* Weekly regression runs using fixed prompts

* Verifies:

  * Consistency of tone and structure

  * Accuracy of energy projections

  * Handling of edge cases (e.g., missing roof types)

---

## **4\. QA Readiness Checklist**

A structured checklist ensures readiness before production deployment.

### **Testing Coverage**

* ≥ 80% coverage for backend Cloud Functions

* Manual QA of offline mobile flows

* Cross-platform testing (iOS, Android, desktop)

* Staging data mirrors production user flows

### **Security & Roles**

* Role-based access tested across all routes

* Rule enforcement verified via emulators

* No cross-role impersonation allowed

### **Documentation**

* `README.md`, `CONTRIBUTING.md`, and build docs updated

* All modules linked to specific test cases

* Environment variables for staging and production documented

### **Release Verification**

* CI passes on the main branch

* TestFlight build uploaded successfully

* Clean deployment of Cloud Functions

* GitHub workflows (CI/CD) are green

### **Regression Testing**

* CRM functionality (create/edit/delete) verified

* AI proposal flow tested post-deployment

* Mobile job/photo sync validated

* Notifications sent to correct users

### **Approvals**

* Final sign-off by:

  * QA Lead

  * Tech Lead

  * Product Manager

---

## **5\. Test Environments**

Distinct Firebase environments are maintained to support agile development and testing.

| Environment | Purpose | Access |
| ----- | ----- | ----- |
| **dev** | Active development | Locally seeded, open |
| **staging** | Pre-release internal QA | Hosted, password-protected |
| **prod** | Live production | Post-merge to main only |

---

## **6\. Test Data & Fixtures**

Predefined dummy data and mocks ensure consistency across test runs.

* `/__fixtures__/` contains CRM records, products, user profiles

* Image mocks simulate mobile uploads

* LangChain mocks provide stable AI testing scenarios

---

## **7\. Bug Tracking and Post-Release Learning**

The `qa/` documentation folder includes tools and templates to track bugs and drive improvement.

### **Postmortem Template**

* Documents:

  * Incident summary

  * What worked / What failed

  * Lessons learned

  * Action items for future releases

### **Ownership**

* QA Lead responsible for postmortems

* Collaborative review with product and engineering

### **Release Notes**

* Known issues are logged and flagged for tracking

* Lessons integrated into future test case expansions (e.g., new edge case coverage)

