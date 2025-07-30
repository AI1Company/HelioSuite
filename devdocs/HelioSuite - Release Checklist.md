# **HelioSuite**

### **Production Release Checklist**

*Version-Controlled Quality Assurance Protocol*

---

## **Purpose**

The HelioSuite Release Checklist ensures that each production release—such as `v1.0.0`, `v1.1.0`, etc.—meets the highest standards of quality, reliability, and security. This checklist **must** be reviewed and signed off by the **QA Lead**, **Tech Lead**, and **Product Manager** before the release is approved.

---

## **1\. Testing Coverage**

### **✅ Unit Test Coverage**

* **Target:** ≥ 80% for all backend Cloud Functions

* Example: `v1.0.0` achieved **91%** unit test coverage

* Focus Areas:

  * CRM field validation

  * Token usage logic

  * Utility services

* **Tools Used:**  
   `vitest`, `jest`, Firestore Emulator for backend test environments

---

### **✅ Manual QA**

* Full end-to-end testing for:

  * Mobile app (offline flows)

  * Web portal

  * Proposal generation logic

  * Role-based user access

* **Tools:**  
   Expo test builds, Firebase Emulator, seeded dummy datasets

* **Tracking:**  
   Manual QA is documented and tracked via **Notion QA Board**

---

### **✅ Cross-Device Testing**

* Devices covered:

  * **iOS**

  * **Android**

  * **Desktop (Chrome)**

---

### **✅ Integration Testing**

* **Staging Environment** configured with:

  * Mock LLMs

  * Seeded Firestore states

* Reproduction of **real user workflows** is confirmed

---

## **2\. Security & Roles**

### **✅ Firebase Security Rules**

* Tested against all role types using:

  * `@firebase/rules-unit-testing`

  * Firestore Emulator Suite

  * `jest`

* **Test Matrix:**

  * **Owner:** Read/write all

  * **Sales Rep:** Read/write customers only

  * **Technician:** Read assigned jobs only

---

### **✅ Role Access Tests**

* Admin **cannot impersonate** Technician

* Owner dashboard **does not** access quote generation

* Roles are scoped via Firebase custom claims and tested for privilege isolation

---

## **3\. Documentation**

### **✅ Repository Documentation**

* Required files:

  * `README.md`

  * `CONTRIBUTING.md`

  * Build instructions

* Located in:  
   `helio-suite/docs/development/`

---

### **✅ Test Case Traceability**

* Each feature/module must:

  * Be mapped to a test case

  * Be listed with expected behavior and test inputs

---

### **✅ Environment Configuration**

* Both **Staging** and **Production** configurations must be:

  * Documented

  * Version-controlled

---

## **4\. Release Verification**

### **✅ CI/CD Pipeline**

* **All GitHub workflows must be green**

  * Lint: `npm run lint`

  * Tests: `npm run test`

  * Firebase deployment: `firebase deploy --only functions,hosting`

  * CI triggered on: Push/PR to `main`

* **CI Platform:** GitHub Actions

---

### **✅ Mobile Build Validation**

* iOS build must pass **TestFlight upload**

* Android build must meet **Play Store** criteria

---

### **✅ Firebase Deployment**

* Functions deployed from a **clean build**

* Environment variables and build artifacts confirmed

---

## **5\. Regression Testing**

### **✅ CRM Functionality**

* **Create/Edit/Delete** verified

### **✅ AI Proposal Generation**

* Full flow:  
   Input → Prompt → LLM → PDF → Firestore

* Validation:

  * PDF contains correct sections

  * Job links are functional

  * Output matches expected formatting

---

### **✅ Job Syncing**

* Job created on web → synced to mobile

* Offline edits made on mobile → synced back

* **Photo Upload:**  
   Confirmed working across sync states

---

### **✅ Notification Delivery**

* Alerts reach appropriate users (Technician, Owner, Admin)

* SMS, Email, and Push (where configured) validated

---

## **6\. Post-Release Learning**

### **✅ Postmortem Template**

* Must be published within **5 days** of release

* Includes:

  * Retrospective summary

  * Resolved issues

  * Actionable follow-ups with owner assignments

---

## **Sign-Off**

| Role | Name | Signature | Date |
| ----- | ----- | ----- | ----- |
| **QA Lead** |  |  |  |
| **Tech Lead** |  |  |  |
| **Product Manager** |  |  |  |

