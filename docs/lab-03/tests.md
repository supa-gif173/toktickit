# Test Specification (Sprint 3)

## 1. Automated Test Plan Overview
This test plan covers the required Test DD and TDD approach for Sprint 3, ensuring comprehensive coverage across unit, API/integration, UI components, authorization, regression, and End-to-End (E2E) layers.

## 2. API / Integration Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| API-01 | API | AC-01 | Valid login | Authenticated response; safe user data returned | `server/tests/lab-03/auth.api.test.ts` | Pass |
| API-02 | API | AC-02 | Invalid login credentials | 401 Unauthorized; no session established | `server/tests/lab-03/auth.api.test.ts` | Pass |
| API-03 | API | BR-01 | Login as inactive user | 403 Forbidden; safe error message | `server/tests/lab-03/auth.api.test.ts` | Pass |
| API-04 | API | AC-03 | Requester accesses own ticket | 200 OK; Ticket data returned | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| API-05 | API | AC-03 | Requester accesses other ticket | 403 or 404; No data leaked | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| API-06 | API | FR-05 | IT Staff accesses Queue | 200 OK; Returns paginated tickets | `server/tests/lab-03/staff-queue.api.test.ts` | Pass |
| API-07 | API | FR-05 | IT Staff Queue search | 200 OK; Returns filtered matching tickets | `server/tests/lab-03/staff-queue.api.test.ts` | Pass |
| API-08 | API | AC-04 | Requester requests Internal Notes | 403 Forbidden; no note data returned | `server/tests/lab-03/comments-notes.api.test.ts` | Pass |
| API-09 | API | FR-06 | IT Staff claims ticket | 200 OK; Owner updated to IT Staff user | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| API-10 | API | BR-09 | Admin creates user with duplicate email | 409 Conflict; clear error message | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| API-11 | API | AC-05 | Admin deactivates own account | 400 or 409 Conflict; Request rejected | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| API-12 | API | BR-07 | Admin deactivates last active Admin | 400 or 409 Conflict; Request rejected | `server/tests/lab-03/users-admin.api.test.ts` | Pass |

## 3. UI Component Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UI-01 | Unit/UI | AC-01 | Login component renders correctly | Email, Password, and Submit exist | `client/tests/lab-03/Login.test.tsx` | Pass |
| UI-02 | Unit/UI | AC-02 | Change Password validation | Requires upper, lower, number, min 8 chars | `client/tests/lab-03/ChangePassword.test.tsx` | Pass |
| UI-03 | Unit/UI | FR-05 | IT Queue renders correctly | Table columns, search, pagination present | `client/tests/lab-03/StaffTicketQueue.test.tsx` | Pass |
| UI-04 | Unit/UI | FR-07 | Admin User list displays properly | Data maps to table rows, Edit button exists | `client/tests/lab-03/UserManagement.test.tsx` | Pass |

## 4. End-to-End (E2E) Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| E2E-01 | E2E | AC-01 | Full Login and Logout flow | Authenticates, navigates, log out clears session | `e2e/lab-03/authentication.spec.ts` | Pass |
| E2E-02 | E2E | AC-02 | Initial password login and change | Normal app opens only after valid change | `e2e/lab-03/first-login.spec.ts` | Pass |
| E2E-03 | E2E | FR-06 | IT Staff Ticket workflow | Opens detail, assigns, updates status/priority | `e2e/lab-03/staff-ticket-flow.spec.ts` | Pass |
| E2E-04 | E2E | FR-07 | Admin creates new user | Navigates to admin, fills form, user appears | `e2e/lab-03/user-administration.spec.ts` | Pass |

## 5. Security & Migration Testing
*   **Security Validation:** All API tests (API-03, API-05, API-08) verify that `403 Forbidden` or `404 Not Found` are returned appropriately when access is denied. Testing ensures no sensitive data is leaked in error messages.
*   **Migration/Regression:** E2E tests for Requester flows (creating tickets, viewing own tickets) will verify that Lab 2 functionalities operate correctly under the new authentication model.
