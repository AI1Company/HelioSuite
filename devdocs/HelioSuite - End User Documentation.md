# **HelioSuite End-User Guide**

---

## **1\. Welcome to HelioSuite**

HelioSuite is an AI-powered SaaS platform purpose-built for solar installation businesses. By integrating CRM, job scheduling, invoicing, and AI-generated proposals into a single suite, HelioSuite replaces fragmented tools like Excel, WhatsApp, and paper checklists with a streamlined, intelligent platform.

HelioSuite empowers teams to operate with intelligence, efficiency, and transparency—simplifying quoting, scheduling, and customer communication while reducing administrative overhead and improving quote accuracy and speed.

---

## **2\. User Roles and Access**

HelioSuite uses Role-Based Access Control (RBAC) to assign permissions based on user roles. Users log in via Firebase Authentication (email/password), and access is determined by their assigned role.

### **Primary Roles**

* **Admin**  
   Full access to CRM, proposals, scheduling, and user management via the Web Admin Portal.

* **Technician**  
   Uses the Mobile App for assigned jobs. Has read-only access to assigned jobs and can update job status, upload photos, and mark jobs as complete.

* **Owner**  
   Views dashboards, usage metrics, analytics, and manages billing. Has read-only CRM access but no quote or job update permissions.

* **Sales Rep**  
   Access to leads, customer profiles, and the ability to generate proposals.

---

## **3\. Core Modules and Features**

HelioSuite is structured into key functional modules tailored to each user role.

---

### **For Admin/Office Users**

**(Web Admin Portal – ReactJS)**

#### **CRM & Lead Management**

* Add, edit, and view leads and customers.

* Manage contact details, site addresses, and installation history.

* Track the sales pipeline with status filters.

* Automate lead follow-ups via email/SMS.

* Convert leads to client profiles.

#### **AI Proposal Generation**

* Generate solar proposals (PDF) from project data using AI (GPT-4-turbo via LangChain).

* Proposals include:

  * Savings projections

  * Estimated system size

  * Visual sections and recommendations

* Input enrichment auto-fills fields like panel type and mounting assumptions.

* Admins can customise prompt configurations (e.g., preprompts, locale-specific inputs).

* Edit proposals before sending to clients.

#### **Job Scheduling & Project Management**

* Assign technicians and manage schedules.

* Track progress by technician and task.

* Define and monitor job milestones (e.g., quote, site visit, installation).

* Enable new job notifications.

#### **Admin Tools**

* Manage users and role assignments.

* Maintain product/component catalog (via structured JSON).

* Configure access levels and workflow settings.

---

### **For Field Technicians**

**(Mobile App – React Native, Expo)**

#### **Offline-First Job Management**

* App functions without a live internet connection.

* Changes are stored in IndexedDB and synced upon reconnection.

#### **Job Details & Updates**

* View assigned jobs with full task context.

* Update job status, add notes, and log completion.

* Upload job site photos (securely tied to job IDs).

#### **Job Completion & Sync**

* Mark tasks as complete and sync data to the Web Admin Portal once online.

---

### **For Business Owners**

#### **Usage Dashboard**

* View platform-wide activity: quotes sent, job completions, and team engagement.

#### **Billing & Subscription**

* View current plan and feature usage.

* Upgrade or manage subscriptions.

* Download PDF invoices.

#### **Analytics & Dashboards**

* Visualise performance trends.

* Track quote-to-job conversion rates.

* Monitor ROI.

* (Planned) Team performance analytics.

---

## **4\. General Platform Features**

### **Offline Support**

* The mobile app is designed for offline-first workflows.

* All offline changes are queued and synced automatically.

### **Security & Permissions**

* User access is strictly controlled via RBAC.

* Examples:

  * Technicians cannot view CRM data.

  * Owners do not have access to proposal generation.

  * Sales reps cannot manage user accounts.

### **Reporting & Exporting**

* Export data (e.g., leads, jobs, proposals) as CSV files.

* Suitable for deeper analysis and backups.

### **Troubleshooting**

* **AI Accuracy**: Admins can manually edit proposals before sending.

* **Mobile Sync Delays**: Uses auto-merge and IndexedDB syncing to avoid data loss.

* For additional troubleshooting, refer to the release notes documentation.

---

## **Conclusion**

HelioSuite is built to deliver a seamless, reliable, and intuitive experience for all user roles—whether in the office or on the job site. Its intelligent design helps solar installation businesses eliminate fragmentation, streamline operations, and scale efficiently.

