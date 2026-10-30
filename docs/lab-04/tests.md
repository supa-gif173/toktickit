# Test Specification (Sprint 4)

## 1. Automated Test Plan Overview
This test plan establishes the Test-Driven Development (TDD) strategy and Acceptance Criteria traceability for Lab 4. The test suites cover all newly introduced features—Actions Taken, Ticket Workflow/Resolution Gate, Requester Dashboard, and IT Staff Dashboard—while guaranteeing zero regression across Labs 1 to 3.

Testing spans five distinct layers:
1. **API / Integration Tests:** Supertest suites executing HTTP requests against Express routes with live database assertions.
2. **UI Component Tests:** React Testing Library and Vitest verifying rendering, state transitions, validation, and accessibility.
3. **Workflow & Concurrency Tests:** Validating the Status Transition Matrix, Resolution Gate prerequisites, and optimistic concurrency conflicts.
4. **End-to-End (E2E) Tests:** Playwright browser automation simulating complete user journeys across Desktop, Tablet, and Mobile viewports.
5. **Regression Test Suite:** Preserving all 43 server tests and 14 client component tests from earlier labs.

---

## 2. API / Integration Tests

| Test ID | Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API-01** | API | AC-01, FR-01 | Create valid Action Taken by IT Staff | 201 Created; action linked to ticket with authenticated user as `performedBy`, initial status PENDING | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-02** | API | AC-02, BR-04 | Requester attempts to create Action Taken | 403 Forbidden; creation rejected | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-03** | API | AC-03, BR-04 | Requester retrieves actions for other user's ticket | 403 Forbidden or 404 Not Found; no data leaked | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-04** | API | AC-04, BR-03 | Action creation with `followUpRequired=true` but missing `followUpNote` | 400 Bad Request; validation error returned | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-05** | API | FR-03, BR-03 | Update existing Action Taken in PENDING/IN_PROGRESS state | 200 OK; updated fields persisted with version increment | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-06** | API | AC-07, BR-06 | Resolve ticket without any Actions Taken (Resolution Gate) | 400 Bad Request (`RESOLUTION_GATE_FAILED`); rejected due to missing action | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| **API-07** | API | AC-08, BR-05, BR-06 | Resolve ticket meeting all Resolution Gate prerequisites | 200 OK; status changes to RESOLVED and version increments | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| **API-08** | API | BR-05 | Illegal status transition (e.g. NEW &rarr; RESOLVED directly) | 400 Bad Request; illegal transition rejected | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| **API-09** | API | AC-09, BR-07 | Requester toggles "Problem Appears Resolved" | 200 OK; advisory flag updated without changing status | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| **API-10** | API | AC-12, BR-11 | Optimistic concurrency collision on ticket status update (`expectedVersion` mismatch) | 409 Conflict; update rejected via atomic write predicate | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| **API-11** | API | AC-10, BR-08 | Retrieve Requester dashboard metrics | 200 OK; returns accurate personal counts and recent tickets | `server/tests/lab-04/requester-dashboard.api.test.ts` | Planned |
| **API-12** | API | AC-11, BR-09 | Retrieve IT Staff dashboard metrics | 200 OK; returns unassigned, assigned-to-me, status/priority breakdown | `server/tests/lab-04/staff-dashboard.api.test.ts` | Planned |
| **API-13** | API | BR-10 | Non-Staff access to Staff dashboard endpoint | 403 Forbidden; rejected | `server/tests/lab-04/staff-dashboard.api.test.ts` | Planned |
| **API-14** | API | AC-05, BR-02 | Assign Action Taken to inactive user or non-staff | 400 Bad Request (`INACTIVE_ASSIGNEE`); assignment rejected | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-15** | API | AC-06, BR-03 | Action Taken lifecycle: complete without result & terminal lock | 400 Bad Request if result missing on complete; 400 Bad Request on editing COMPLETED/CANCELLED action | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-16** | API | AC-08, BR-13 | Append-only Ticket Status History audit row created in same transaction | 200 OK; history record created with fromStatus, toStatus, changedById, timestamp | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| **API-17** | API | AC-12, BR-11 | Optimistic concurrency collision on Action Taken update (`expectedVersion` mismatch) | 409 Conflict; concurrent action edit rejected via atomic predicate | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-18** | API | AC-07, BR-06 | Resolution Gate prerequisites: unassigned ticket owner or incomplete follow-up note | 400 Bad Request (`RESOLUTION_GATE_FAILED`); resolution blocked | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |

---

## 3. UI Component Tests

| Test ID | Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UI-01** | Component | FR-07, AC-10 | Requester Dashboard renders metrics and recent tickets | Cards render accurate values; quick-actions exist | `client/tests/lab-04/RequesterDashboard.test.tsx` | Planned |
| **UI-02** | Component | FR-08, AC-11 | IT Staff Dashboard renders operational metrics | Cards for New, Open, In Progress, etc. render; drill-down links valid | `client/tests/lab-04/StaffDashboard.test.tsx` | Planned |
| **UI-03** | Component | FR-01, AC-01 | Actions Taken list and create modal on Ticket Detail | Renders actions table; opens modal on 'Add Action' click | `client/tests/lab-04/ActionsTaken.test.tsx` | Planned |
| **UI-04** | Component | AC-04, BR-03 | Actions Taken form validation | Shows inline error when Follow-Up is checked without note or result missing on complete | `client/tests/lab-04/ActionsTaken.test.tsx` | Planned |
| **UI-05** | Component | AC-02, BR-04 | Actions Taken view under Requester session | Actions are read-only; Add Action button is hidden | `client/tests/lab-04/ActionsTaken.test.tsx` | Planned |
| **UI-06** | Component | AC-07, AC-08 | Ticket Workflow status transition dropdown & checklist | Displays permitted transitions; displays Resolution Gate prerequisites checklist | `client/tests/lab-04/TicketWorkflow.test.tsx` | Planned |
| **UI-07** | Component | AC-09, BR-07 | Requester Resolution indicator toggle | Renders checkbox/button; triggers API call and feedback | `client/tests/lab-04/TicketWorkflow.test.tsx` | Planned |
| **UI-08** | Component | AC-14, Part 9 | Axe-core accessibility scan on Dashboards and Ticket Details | Zero WCAG 2.1 AA violations across tested components | `client/tests/lab-04/A11yScan.test.tsx` | Planned |
| **UI-09** | Component | AC-06, BR-03 | Terminal lock UI on completed/cancelled actions | Action rows show locked badge; edit controls disabled | `client/tests/lab-04/ActionsTaken.test.tsx` | Planned |
| **UI-10** | Component | AC-08, BR-13 | Ticket Status History timeline rendering | Chronologically renders status audit entries with actor badges | `client/tests/lab-04/TicketHistory.test.tsx` | Planned |

---

## 4. End-to-End (E2E) Tests

| Test ID | Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **E2E-01** | E2E | FR-01, FR-03, AC-01 | Complete Actions Taken workflow | IT Staff logs in, opens ticket, adds action, edits action, verifies table | `e2e/lab-04/actions-taken-flow.spec.ts` | Planned |
| **E2E-02** | E2E | FR-05, AC-05, AC-06 | Resolution Gate and status lifecycle | Attempt resolve without actions (blocked) &rarr; add action &rarr; resolve ticket (succeeds) | `e2e/lab-04/ticket-resolution.spec.ts` | Planned |
| **E2E-03** | E2E | FR-07, FR-08, AC-08 | Dashboard navigation and drill-downs | Login as Requester/Staff, view dashboard, click metric card, verify filtered queue | `e2e/lab-04/dashboards.spec.ts` | Planned |

---

## 5. Regression & Security Test Plan
* **Labs 1–3 Regression Suite:**
  - `health.test.ts` & `categories.test.ts` (Lab 1)
  - `auth.api.test.ts`, `authorization.api.test.ts`, `requester-tickets.api.test.ts`, `staff-queue.api.test.ts`, `staff-ticket-detail.api.test.ts`, `comments-notes.api.test.ts`, `users-admin.api.test.ts` (Lab 3)
  - `Login.test.tsx`, `ChangePassword.test.tsx`, `StaffTicketQueue.test.tsx`, `StaffTicketDetail.test.tsx`, `UserManagement.test.tsx` (Lab 3)
* **Responsive Layout Verifications:** Automated Playwright viewport checks verify zero horizontal scroll on mobile (375px) and tablet (768px) across both Dashboards and the Ticket Detail screen.
