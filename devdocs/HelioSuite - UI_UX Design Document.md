# **HelioSuite**

### **UI/UX Design Document**

---

## **1\. Introduction & Vision**

**Purpose**  
 This document defines the user interface and user experience design for HelioSuite, ensuring consistency, usability, and alignment with user needs and business goals.

**Product Vision**  
 HelioSuite aims to empower solar installation businesses with intelligence, efficiency, and transparency. The platform simplifies administrative processes, accelerates quote generation, and provides scalable visibility through AI-powered tools.

**Core Design Principles**

* **Customer-Centric:** Interfaces reflect real-world workflows and user contexts.

* **Reliable:** Especially in offline environments for technicians.

* **Fast:** Designed to minimize user steps and reduce task completion time.

* **Clear:** Unified flows, clean layouts, and role-specific simplification.

---

## **2\. Target Audience & Personas**

### **Installer Technician (Field Worker)**

* **Platform:** Mobile App (Android/iOS)

* **Needs:**

  * Offline access

  * Quick data entry (client details, photos, job updates)

  * Clear job statuses and progress indicators

### **Operations Manager (Office Admin)**

* **Platform:** Web Dashboard

* **Needs:**

  * CRM and job scheduling

  * Proposal generation

  * Lead tracking and follow-ups

### **Business Owner**

* **Platform:** Web Dashboard

* **Needs:**

  * Monitoring dashboards

  * ROI, usage metrics, and performance insights

  * Billing and subscription management

### **Sales Representative**

* **Platform:** Web Dashboard

* **Needs:**

  * Access to CRM and proposal generator

  * Simplified quote generation workflow

---

## **3\. Core Workflows & User Journeys**

### **Admin Creates Client & Sends AI Proposal**

**Flow:**  
 Dashboard → Create New Lead → Input Site Details → Select Products → Generate Proposal → Preview/Review → Send via Email

**UI Elements:**

* Lead form

* Product selection dropdown

* AI-generated proposal preview

* Action buttons: Generate / Edit / Send

---

### **Technician Logs Job Updates (Offline Mode)**

**Flow:**  
 Mobile App → View Assigned Jobs → Open Job → Update Status → Upload Photos → Submit

**Offline Handling:**  
 Data stored locally (IndexedDB), syncs automatically on reconnection.

**UI Elements:**

* Job list with statuses

* Offline indicator (e.g., banner or icon)

* Photo uploader

* Status selector and notes field

---

### **Admin Follows Up on Stale Leads**

**Flow:**  
 CRM Table → Filter by Inactive \>14 Days → Auto Follow-Up → Email/SMS Sent → Status Updated

**UI Elements:**

* CRM table with filters

* "Auto Follow-Up" button

* Status change notifier

---

### **Owner Views Usage & Billing**

**Flow:**  
 Admin Portal → Billing & Usage Tab → Review Metrics → View Plan Details → Upgrade Plan

**UI Elements:**

* Graphs and data visualizations

* Billing summary

* Upgrade button and pricing tier descriptions

---

## **4\. UI Components & Layout**

### **Web Admin Portal**

**Structure:**

* **Components:** `/web/src/components`

* **Pages:** `/web/src/pages`

* **Domain Logic:** `/web/src/features`

**Key Screens:**

* **CRM & Dashboard:** Lead management, scheduling, customer profiles

* **AI Proposal Generator:** Product selector, prompt builder, proposal preview

* **Reporting & Billing:** Usage stats, subscription view, CSV exports

* **Notification Settings:** Follow-up workflows, job reminders

**Styling:**  
 TailwindCSS with modular class structures. Custom overrides for responsive and role-specific UIs.

---

### **Mobile App (Technician)**

**Structure:**

* **Screens:** `/mobile/src/screens`

* **Components:** `/mobile/src/components`

* **Local Storage:** `/mobile-app/localdb` (IndexedDB for offline queueing)

**Key Features:**

* Offline-first job management

* Photo capture and job notes

* Real-time sync when reconnected

**Styling:**  
 React Native’s `StyleSheet` API, with visual cues for offline status (e.g., greyed-out buttons, sync icons)

---

## **5\. AI Integration UI**

### **Proposal Generation Interface**

* Structured forms collect site details and solar preferences

* Proposal preview displays auto-generated content

* Downloadable PDF output and in-line editing available before send

### **Admin Prompt Editing**

* Access to system and user prompt templates

* Editable fields for tone, regional settings, and language tuning

* Version history of edited prompts

---

## **6\. Security & Permissions in UI**

**Role-Based Visibility & Interactions:**

* **Feature Toggling:** Elements are hidden or disabled based on roles (e.g., Technician cannot see CRM).

* **Read-Only Views:** Owners can view reports but not edit CRM.

* **Dynamic Menus:** Navigation items rendered based on user claim from Firebase Auth.

**UI Behavior Examples:**

| Role | CRM Access | Proposal Generator | Billing Tab | Job Upload |
| ----- | ----- | ----- | ----- | ----- |
| Technician | Hidden | Hidden | Hidden | Enabled |
| Admin | Full | Full | Enabled | Enabled |
| Sales Rep | Read/Write | Full | Hidden | Read-Only |
| Owner | Read | Read | Full | Read-Only |

---

## **7\. Design Rationale**

* **Modularity:** Each UI element corresponds to feature modules in the codebase, making testing and updates efficient.

* **Offline UX:** Technician flows are built with low-connectivity assumptions and sync reliability.

* **Role-Responsive UI:** Design anticipates scalable team structures with minimal access conflict.

* **AI Trust:** Proposal previews are editable, giving users control over AI-generated content before sharing.

---

## **8\. Visual Elements & Wireframes**

The UI/UX document incorporates annotated wireframes and mockups to visualize layouts, user paths, and interactions across key modules. Wireframes reflect:

* CRM dashboard grid and lead filters

* AI proposal preview with content blocks

* Mobile job screen with photo and status controls

* Offline sync indicators and feedback banners

Mockups mirror actual production designs referenced in HelioSuite’s pitch materials and internal demos.

---

## **9\. Tooling & Implementation Notes**

* **Web Frontend:** Built using React

* **Mobile App:** Built using React Native \+ Expo

* **UI Folder Structure:**

  * `/components`: Shared visual elements

  * `/pages`: Route-level views (web)

  * `/screens`: Functional views (mobile)

* **Testing:**

  * Playwright for UI tests (web)

  * Expo Test Tools for mobile flows

  * Unit/component tests for reusability validation  
