# Lab 2 Sprint Testing Specification

## 1. Test Strategy
Our testing strategy for the MVP Requester-facing portal follows a multi-layered approach to ensure high quality and adherence to requirements. We emphasize Test-Driven Development (TDD) principles where applicable. The testing layers include:
- **Unit Tests:** To validate isolated business logic, data models, and utility functions (e.g., file size validation logic).
- **API (Integration) Tests:** To ensure the backend endpoints enforce business rules, data isolation, and handle payload validation correctly.
- **UI (Component) Tests:** To verify that React components render correctly, handle local state (like form validation), and match the Zen Green UI specifications.
- **End-to-End (E2E) Tests:** To simulate real user workflows from end-to-end, ensuring the frontend and backend integrate seamlessly, particularly for the ticket creation and attachment lifecycles.

## 2. Planned Tests

| Test ID | Requirement/AC | Type | What It Tests | Expected Result | Automated Test File | Final |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TEST-001** | AC-01 | UI | Submitting a valid Create Ticket form. | Form submits successfully, loading state shown, redirects to detail page. | `client/tests/lab-02/CreateTicketForm.test.tsx` | Pending |
| **TEST-002** | AC-01 | API | Creating a ticket via POST `/api/tickets` with valid payload. | Returns `201 Created`, ticket has 'New' status and unique Ticket Number. | `server/tests/lab-02/tickets.api.test.ts` | Pending |
| **TEST-003** | AC-02 | UI | Accessing protected routes without a selected mock requester. | Automatically redirects the user to the Development Requester selection screen. | `client/tests/lab-02/AuthGuard.test.tsx` | Pending |
| **TEST-004** | AC-03 | API | Accessing `GET /api/tickets/:id` for a ticket owned by another requester. | Backend returns `403 Forbidden` or `404 Not Found`. | `server/tests/lab-02/tickets.security.test.ts` | Pending |
| **TEST-005** | AC-04 | UI | Viewing "My Tickets" when the user has 0 tickets. | Renders the designated empty state illustration and prompt message. | `client/tests/lab-02/TicketList.test.tsx` | Pending |
| **TEST-006** | AC-05 | Unit | Validating a file attachment sized at 6MB. | Validation function returns an error indicating size limit exceeded (5MB). | `server/tests/lab-02/attachment.utils.test.ts` | Pending |
| **TEST-007** | AC-05 | API | Uploading a 6MB file via POST `/api/attachments`. | Returns `400 Bad Request` with file size error message. | `server/tests/lab-02/attachments.api.test.ts` | Pending |
| **TEST-008** | AC-06 | Unit | Validating an attachment with `.exe` extension/MIME type. | Validation function returns an error indicating unsupported file type. | `server/tests/lab-02/attachment.utils.test.ts` | Pending |
| **TEST-009** | AC-06 | API | Uploading an `.exe` file via POST `/api/attachments`. | Returns `400 Bad Request` with allowed types error message. | `server/tests/lab-02/attachments.api.test.ts` | Pending |
| **TEST-010** | AC-07 | UI | Attaching a 6th file in the UI when 5 are already attached. | UI blocks selection, displays inline error regarding 5-file limit. | `client/tests/lab-02/FileUploader.test.tsx` | Pending |
| **TEST-011** | AC-07 | API | Uploading a 6th file for a ticket via API. | Returns `400 Bad Request` enforcing the 5-file maximum limit. | `server/tests/lab-02/attachments.api.test.ts` | Pending |
| **TEST-012** | AC-08 | API | Soft removing an attachment via DELETE `/api/attachments/:id`. | Returns `200 OK`, database updates `deletedAt` field, physical file remains. | `server/tests/lab-02/attachments.api.test.ts` | Pending |
| **TEST-013** | AC-09 | API | Fetching ticket details containing a soft-removed attachment. | The removed attachment is omitted from the returned attachments array. | `server/tests/lab-02/tickets.api.test.ts` | Pending |
| **TEST-014** | AC-10 | UI | Clicking 'Page 2' on the My Tickets dashboard. | UI updates to show items 11-20, network request fires with `page=2`. | `client/tests/lab-02/TicketList.test.tsx` | Pending |
| **TEST-015** | AC-01..10 | E2E | Full requester workflow: select mock auth, create ticket, upload attachment, view list, view details, remove attachment. | All steps complete successfully, simulating a complete user journey. | `e2e/lab-02/requester-workflow.spec.ts` | Pending |

## 3. Acceptance-Criterion Traceability

The following matrix maps the Acceptance Criteria defined in the specification to the planned Test IDs:

*   **AC-01 (Successful Ticket Creation):** TEST-001, TEST-002, TEST-015
*   **AC-02 (Requester Context Required):** TEST-003, TEST-015
*   **AC-03 (Cross-Requester Data Isolation):** TEST-004
*   **AC-04 (Empty State Rendering):** TEST-005
*   **AC-05 (Attachment Size Limit Rejection):** TEST-006, TEST-007
*   **AC-06 (Attachment Type Limit Rejection):** TEST-008, TEST-009
*   **AC-07 (Attachment Count Limit Rejection):** TEST-010, TEST-011
*   **AC-08 (Attachment Soft Removal):** TEST-012, TEST-015
*   **AC-09 (Soft Removed Files Excluded):** TEST-013
*   **AC-10 (Pagination Navigation):** TEST-014

## 4. Responsive and Visual Checklist

During manual UI testing and automated visual regression testing (if applicable), the following checklist MUST be verified:

*   [ ] **Zen Green Theme Compliance:** Ensure primary brand color `#006B3C` and secondary/accent color `#0B7A46` are used correctly for buttons, active states, and highlights.
*   [ ] **Desktop Layout (>1024px):** Forms and data tables utilize available screen real estate optimally without excessive stretching.
*   [ ] **Tablet Layout (768px - 1024px):** Grid columns adjust, and padding scales down appropriately.
*   [ ] **Mobile Layout (320px - 767px):** Multi-column layouts stack into single columns. Data tables switch to card-based layouts or scroll horizontally gracefully. No unintended horizontal body scrolling.
*   [ ] **Form Validation Visuals:** Input fields with errors display clear red borders and human-readable helper text below the field.
*   [ ] **Accessibility (A11y):** All form inputs have associated labels, buttons have descriptive text, and contrast ratios meet WCAG AA standards.

## 5. Test Commands

To execute the automated test suites, use the following commands from the root directory:

**Backend (API & Unit Tests):**
```bash
cd server
npm run test
```

**Frontend (UI Component Tests):**
```bash
cd client
npm run test
```

**End-to-End Tests (e.g., Playwright/Cypress):**
```bash
npm run test:e2e
```

## 6. Final Results
*Currently Pending. Test execution results will be recorded here upon completion of the development sprint.*

## 7. Known Limitations or Deferred Tests
*   **Actual File Deletion:** Because this MVP utilizes a soft-removal strategy, we are not actively testing the hard deletion of files from the file system.
*   **Cloud Storage Mocking:** As files are stored on the local backend server for Lab 2, we are explicitly skipping integration tests for external cloud storage providers (e.g., AWS S3).
*   **Authentication E2E:** Since the Development Requester mechanism is a mock for testing, comprehensive security and session expiration E2E tests are deferred until a real authentication provider (e.g., OAuth2/JWT) is implemented in a future lab.
