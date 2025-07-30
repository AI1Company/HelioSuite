# **HelioSuite**

### **API Documentation**

---

## **1\. Introduction to HelioSuite’s API**

HelioSuite is architected as a modular SaaS platform built on Firebase. Its backend logic—serving as the core API—is implemented using **Firebase Cloud Functions** in **Node.js**. These functions are responsible for key features including:

* AI proposal generation

* Data validation

* Offline queue synchronisation

* Notifications and logging

This architecture enables rapid iteration, high availability, and regional scalability via Firebase quotas.

---

## **2\. API Endpoints (Firebase Cloud Functions)**

All backend logic is defined as Cloud Functions. Each function corresponds to a specific API task or workflow.

### **Key Functions**

| Function | Purpose |
| ----- | ----- |
| `generateProposal()` | Generates solar proposals using LangChain \+ OpenAI; validates input, builds prompt, and generates PDFs saved to Firestore. |
| `logSyncError()` | Captures mobile sync issues and logs them for admin inspection. |
| `sendNotif()` | Sends alerts via push, SMS, or email (configurable). |
| `flushQueue()` | Syncs technician-submitted job updates from offline queue to Firestore when reconnected. |
| `aiProposal.js` / `proposalGen.ts` | Main handler for LangChain \+ GPT-4-turbo proposal generation. |
| `authTriggers.ts` | Manages user signup/login events and role-based metadata assignment. |
| `syncMonitor.ts` | Monitors job queue sync health, metrics, and offline logs. |
| `validators.js` | Contains reusable input validation logic. |

### **Codebase Structure**

Cloud Functions are structured for clarity and modularity under `/firebase/functions` (or `/functions` in monorepo), following a **one-function-per-file** pattern. Each file corresponds to a discrete logic unit and follows consistent naming conventions.

---

## **3\. Authentication & Authorisation**

### **Authentication**

* Firebase Authentication using **email/password**

* User roles are managed via **Custom Claims**

### **Role-Based Access Control (RBAC)**

Defined roles include:

| Role | Permissions |
| ----- | ----- |
| **Admin** | Full access to users, billing, prompt editor, and CRM |
| **Owner** | View billing, reports, and usage analytics |
| **Sales Rep** | Manage leads, generate proposals |
| **Technician** | Access assigned jobs, upload photos, update statuses |

Access is enforced:

* On the **frontend** (UI rendering and route restrictions)

* Within **Firebase Security Rules**

* Inside **Cloud Functions** (via token validation)

### **Security Testing**

* Conducted with `@firebase/rules-unit-testing`

* Validates access patterns and role-restricted write/read logic using Firestore Emulator

---

## **4\. Data Formats (Request & Response)**

### **Input Validation**

All Cloud Functions:

* Validate incoming inputs using custom validation logic

* Reject malformed or incomplete requests with structured errors

### **Response Format**

Cloud Functions return structured JSON:

{  
  "status": "success",  
  "data": { ... }  
}

Or in error scenarios:

{  
  "error": {  
    "message": "Invalid input",  
    "code": 400  
  }  
}

### **Data Models**

| Collection | Fields |
| ----- | ----- |
| `/users/{uid}` | `displayName`, `role`, `installerId`, `email` |
| `/customers/{cid}` | `contactInfo`, `siteDetails`, `linkedJobs[]` |
| `/jobs/{jid}` | `status`, `assignedTech`, `photos`, `timeline`, `notes` |
| `/proposals/{pid}` | `pdfUrl`, `inputData`, `createdBy`, `versionHistory[]` |

Each record includes `createdAt` and `updatedAt` (server timestamps).

---

## **5\. Error Handling**

### **Try/Catch Wrapping**

All Cloud Functions include structured try/catch logic to:

* Return meaningful error responses

* Prevent app crashes on unexpected inputs

* Aid client-side handling

### **Error Structure Example**

{  
  "error": {  
    "message": "Token expired",  
    "code": 401  
  }  
}

### **Logging**

* Logs include function name, timestamp, and user ID (where applicable)

* Logs sent to Firebase Console for observability

---

## **6\. External Integrations via Functions**

### **LLM Proposal Integration**

* `generateProposal()` integrates with:

  * **LangChain** for prompt orchestration and retries

  * **OpenAI GPT-4-turbo** for text generation

* Outputs are post-processed into:

  * HTML preview

  * PDF stored in Firestore Storage

### **Planned Integrations**

* **SMS Gateway:** For alerts and notifications to customers and staff

---

## **7\. Development & Testing**

### **Local Development**

* Firebase Emulator Suite supports:

  * Firestore, Auth, and Functions

* Test flows:

  * Offline queue → flushQueue() → Firestore

  * Proposal input → LangChain → OpenAI → PDF

### **Unit Testing**

* Tool: `jest`

* Scope:

  * `aiProposal.js`

  * `validators.js`

  * `syncMonitor.ts`

### **Integration Testing**

* Uses **Firebase Emulator** \+ seeded data

* Validates:

  * Proposal flow end-to-end

  * Offline sync flow

  * Auth \+ RBAC rules

### **CI/CD Automation**

* **GitHub Actions** run:

  * Linting

  * Type-checking

  * Unit \+ integration tests

* On pass, CI auto-deploys functions via:

firebase deploy \--only functions

