# **HelioSuite Working Papers**

### **Comprehensive Documentation Across the Project Lifecycle**

---

## **Overview**

HelioSuite’s *working papers* represent the full suite of internal documentation supporting product development, quality assurance, release management, and strategic planning. These documents are organized in the GitHub repository and mirror the full lifecycle of a software product—from ideation to post-release reflection.

Each document type is grouped by function, ensuring clarity, traceability, and efficient collaboration across teams.

---

## **1\. Project Foundation**

Foundational documents define HelioSuite’s vision, values, and strategic objectives.

* **`README.md`**  
   Overview of the platform, target users (solar SMEs), tech stack (Firebase, React Native, LangChain), and links to key docs.

* **`CONTRIBUTING.md`**  
   Contribution guidelines including folder structure, style conventions, semantic commit messages, PR flow, and CI requirements.

* **`project-proposal.md`**  
   Executive summary, product overview, goals, success metrics, funding requirements, and timeline.

* **`vision.md` / `vision-scope.md`**  
   Strategic goals, in-scope vs. out-of-scope features for v1, product constraints, and success criteria.

* **`stakeholders.md` / `personas.md`**  
   Core personas (Technician, Office Admin, Owner) and their influence on UX and feature prioritization.

* **`risks-assumptions.md`**  
   Project risks, mitigation strategies, assumptions (e.g., offline-first is mandatory), and constraints (e.g., Firebase-only stack).

---

## **2\. Requirements**

Documents defining the functional blueprint for the HelioSuite platform.

* **`srs.md` (Software Requirements Specification)**  
   Functional and non-functional system requirements.

* **`use-cases.md`**  
   End-to-end user journeys and feature usage scenarios.

* **`feature-list.md`**  
   Comprehensive breakdown of all features by module and user role.

* **`glossary.md`**  
   Definitions of key terms, data fields, and technical concepts used throughout the system.

---

## **3\. Design & Architecture**

These papers capture the platform’s technical architecture, system design, and modularity.

* **`architecture-overview.md`**  
   Firebase-based SaaS overview, component breakdown, data flow, and security model.

* **`module-breakdown.md`**  
   Maps system modules (CRM, AI, Mobile App, Admin Tools) to workflows.

* **`security-permissions.md`**  
   Role-Based Access Control (RBAC), user roles, permissions, and Firebase rules.

* **`firebase-architecture.md`**  
   Explains the structure, use cases, schema, and scaling of Firebase services.

---

## **4\. Development**

Technical standards and operating procedures for developers.

* **`folder-structure.md`**  
   Codebase organization across web, mobile, and backend.

* **`coding-guidelines.md`**  
   Best practices for React/React Native \+ Firebase Functions, naming conventions, Git workflow, and review checklists.

* **`build-deployment.md`**  
   Local dev setup, build instructions, and CI/CD workflows via GitHub Actions.

---

## **5\. QA & Testing**

HelioSuite’s structured quality assurance system with layered testing and CI integration.

* **`test-strategy.md`**  
   Describes QA philosophy, test tiers, coverage goals, and tooling.

* **`unit_test_strategy.md`**  
   Unit testing scope, tools (`vitest`, `jest`), and CI integration.

* **`integration_test_strategy.md`**  
   Full system integration workflows, using Playwright, Expo E2E, and Firebase Emulator.

* **`manual_qa_cases.md`**  
   Scenario-based QA test cases across CRM, proposals, jobs, and roles.

* **`firebase_security_tests.md`**  
   Methods for testing Firestore rules and enforcing RBAC using emulators.

* **`ci_test_plan.md`**  
   Defines GitHub Actions workflows for linting, testing, and deployment validation.

* **`qa-checklist.md`**  
   Pre-release checklist ensuring unit coverage, security validation, documentation completeness, and CI success.

* **`test-cases.md`**  
   Detailed test matrix organized by system modules.

* **`prompt_engineering.md`**  
   Structure, templates, and validation approach for LangChain-powered AI proposal generation.

* **`token_budgeting.md`**  
   AI cost controls, token estimates, per-tier limits, and abuse prevention strategies.

---

## **6\. Project Management**

Planning, tracking, and coordination documents.

* **`wbs.md`**  
   Work Breakdown Structure by task and milestone.

* **`timeline.md`**  
   Phase-based project milestones from MVP to international rollout.

* **`team-roles.md`**  
   Responsibilities and ownership mapping across engineering, QA, and product functions.

* **`meeting-template.md`**  
   Standardised format for recurring stand-ups and retros.

* **`status-report-template.md`**  
   Weekly progress tracking with blockers, milestones, and upcoming tasks.

---

## **7\. Deployment & Support**

Operational documentation for deployment and end-user support.

* **`release-notes.md`**  
   Version history including feature updates, fixes, and known issues.

* **`install-guide.md`**  
   Setup instructions for new developers or system deployments.

* **`user-guide.md`**  
   End-user manual for both web and mobile users.

* **`maintenance-plan.md`**  
   System maintenance cycles, alerting, backups, and uptime checks.

* **`troubleshooting.md`**  
   Common issues and step-by-step resolution guidance.

---

## **8\. Post-Release**

Tools for continuous improvement after each release cycle.

* **`postmortem-template.md`**  
   Retrospective learning document, completed within 5 days of release.

* **`release-checklist.md`**  
   Final sign-off document for production readiness, including testing, roles, CI, and regression validations.

---

## **9\. Investor Documentation**

Strategic, financial, and market-facing collateral for fundraising and investor communication.

* **`business-plan.md`**  
   Full business strategy including market analysis, roadmap, team, and exit strategy.

* **`executive-summary.md`**  
   One-pager for investor outreach summarising product, market, team, and funding ask.

* **`pitch-deck-notes.md`**  
   Talking points and slide content for investor presentations.

* **`financials.md`**  
   Revenue forecasts, cost structures, unit economics, funding tranche milestones, and burn rate projections.

