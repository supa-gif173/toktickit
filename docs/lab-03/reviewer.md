# Lab 3 Peer Review

**Reviewer Identity:** Natsumi

## Pull Requests Reviewed
- [PR #27: Add Lab 3 engineering specifications](https://github.com/supa-gif173/toktickit/pull/27)
- [PR #28: feat: Authentication Foundation (Issue 2)](https://github.com/supa-gif173/toktickit/pull/28)
- [PR #29: feat: IT Staff Ticket Queue & Ticket Operations (Issue 3)](https://github.com/supa-gif173/toktickit/pull/29)
- [PR #30: feat: Admin User Management and Legacy Data Normalization (Issue 4)](https://github.com/supa-gif173/toktickit/pull/30)
- [PR #31: Feature/issue 6 final docs](https://github.com/supa-gif173/toktickit/pull/31)
- [PR #33: feat: Complete Automated Test Suites and E2E Tests (Resolves #32)](https://github.com/supa-gif173/toktickit/pull/33)

## Comments and Responses

### PR #33: Complete Automated Test Suites and E2E Tests
- **Comment 1 (Remove Duplicate Spec File):** `user-administration.spec.ts` is currently duplicated at `client/e2e/lab-03/user-administration.spec.ts` and `e2e/lab-03/user-administration.spec.ts`. Since Playwright runs tests from the root `e2e/` folder, please consider removing the duplicate file in `client/e2e/` to avoid confusion.
  - **Response:** Thank you for pointing this out. We removed the duplicate file at `client/e2e/lab-03/user-administration.spec.ts` and kept the canonical file at `e2e/lab-03/user-administration.spec.ts` to maintain clean repository structure.
- **Comment 2 (Resource Enumeration 403 vs 404):** In `tickets.ts`, when a Requester accesses a ticket owned by another user, it returns 403 Forbidden. If we want to strictly adhere to anti-enumeration best practices (Lab 3 §4.4 / §8.2), returning 404 Not Found would prevent attackers from discovering valid ticket IDs.
  - **Response:** Keeping `403 Forbidden` was an intentional decision to maintain consistency with `tests.md` (`API-05`) and `api-spec.md` (`GET /api/tickets/:id` returns 403 when forbidden). We ensured that no ticket summary, description, or sensitive metadata is leaked in the error payload.
- **Comment 3 (E2E Selector Resilience):** In `staff-ticket-flow.spec.ts`, accessing password inputs by array index (e.g. `passwordFields[1]`) can occasionally be flaky across different DOM render orders. Using explicit labels or `getByPlaceholder()` would make the tests even more robust.
  - **Response:** Updated `staff-ticket-flow.spec.ts` to target explicit input element IDs (`#currentPassword`, `#newPassword`, `#confirmPassword`) from `ChangePasswordModal.tsx`, completely eliminating index-based selector flakiness.

### PR #30: Admin User Management
- **Comment:** Ensure mobile responsiveness for user table and validate server-side inputs for safety constraints (prevent self-deactivation and deactivating last active admin).
  - **Response:** Added mobile responsive card view for admin user management and enforced strict server-side validation rejecting self-deactivation and last-admin deactivation.

### PR #29: IT Staff Ticket Queue & Ticket Operations
- **Comment:** Standardize uppercase formatting for statuses and priorities, fix `.gitignore` file encoding, and document transition matrix.
  - **Response:** Standardized ticket status and priority values to uppercase enums, normalized legacy records, resolved gitignore encoding, and documented transition matrix in `specification.md`.

## Approvals
- [x] PR #27 Approved
- [x] PR #28 Approved
- [x] PR #29 Approved
- [x] PR #30 Approved
- [x] PR #31 Approved
- [x] PR #33 Approved
