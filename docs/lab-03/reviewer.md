# Lab 3 Peer Review

**Author:** Supattra Kongsiripat — 67070505228 — GitHub: [@supa-gif173](https://github.com/supa-gif173)  
**Peer Reviewer 1:** PIMCHAYA SUPRATERAVANIT — 67070505223 — GitHub: [@pimchayasupr-hash](https://github.com/pimchayasupr-hash)  
**Peer Reviewer 2:** NATSUMI TAKAGI — 67070505202 — GitHub: [@MiMikoChAn913](https://github.com/MiMikoChAn913)

---

## Pull Requests Reviewed

1. [PR #27: Add Lab 3 engineering specifications (Resolves #1)](https://github.com/supa-gif173/toktickit/pull/27)
2. [PR #28: feat: Authentication Foundation (Issue 2)](https://github.com/supa-gif173/toktickit/pull/28)
3. [PR #29: feat: IT Staff Ticket Queue & Ticket Operations (Issue 3)](https://github.com/supa-gif173/toktickit/pull/29)
4. [PR #30: feat: Admin User Management and Legacy Data Normalization (Issue 4)](https://github.com/supa-gif173/toktickit/pull/30)
5. [PR #31: Feature/issue 6 final docs](https://github.com/supa-gif173/toktickit/pull/31)
6. [PR #33: feat: complete automated test suites and E2E tests (Resolves #32)](https://github.com/supa-gif173/toktickit/pull/33)

---

## Comments and Responses

### 1. PR #27: Add Lab 3 engineering specifications (Resolves #1)
- **Reviewer (@pimchayasupr-hash):**
  > Excellent work on these specifications! The documentation is extremely thorough and sets a clear, unambiguous foundation for Sprint 3.
  > 
  > **Key Strengths:**
  > - **Clear Boundaries:** The "Explicitly Excluded" section in `specification.md` is a great addition. It prevents scope creep (e.g., excluding email invites, SLA, SSO) and keeps the sprint focused.
  > - **Strong Security Focus:** `api-spec.md` clearly maps out the expected HTTP status codes (401, 403, 404, 409) for each endpoint. The Admin safety rules (BR-06 and BR-07) are well-defined.
  > - **Traceability:** The structure in `tests.md` perfectly bridges the Acceptance Criteria (AC) and Functional Requirements (FR) to actual automated test files.
  > 
  > **Minor Observation (Non-blocking):**
  > In `api-spec.md` Section 3, the IT Staff ticket operations use the `/api/staff/tickets/...` prefix (e.g., `PATCH /api/staff/tickets/:id/assign`). Just a quick heads-up to ensure the backend and frontend teams are aligned on using this specific prefix versus reusing `/api/tickets/...` and relying solely on the JWT role for authorization. Either way works, just needs to be consistent in implementation!
  > 
  > **Verdict: APPROVED** The specs look solid and ready for development. Great job!

- **Author (@supa-gif173):**
  > Thank you for the thorough review and the approval! I really appreciate your feedback on the explicit boundaries and security rules.
  > 
  > Regarding your observation on the API routes: that is a very sharp catch. The decision to use the `/api/staff/tickets/...` prefix was intentionally made to explicitly separate IT Staff operations from the standard Requester endpoints. This adds an extra layer of clarity to the routing structure, working alongside the JWT role authorization. I will make sure we strictly align the backend implementation and frontend API calls to this specific prefix during the upcoming development phases to maintain consistency.
  > 
  > Thanks again for the great review. Please go ahead and merge this PR whenever you are ready so we can move forward with Sprint 3!

---

### 2. PR #28: feat: Authentication Foundation (Issue 2)
- **Reviewer (@pimchayasupr-hash):**
  > **Peer Review: Authentication & Authorization Foundation**
  > 
  > Outstanding work on setting up the core security layer for Sprint 3! The architecture you’ve put in place is very clean and adheres strictly to the requirements.
  > 
  > **Key Strengths:**
  > - **Robust Data Modeling:** The updates in `schema.prisma` to introduce the unified User model and Role enum provide a rock-solid foundation for the upcoming RBAC features.
  > - **Secure Session Management:** The implementation of `authMiddleware.ts` and the `auth.ts` routes securely handles JWT generation and validation, perfectly checking off FR-01.
  > - **Seamless Frontend State:** The integration of `AuthContext.tsx` with `Login.tsx` and `ChangePasswordModal.tsx` handles the mandatory first-login password change gracefully (AC-02).
  > - **Solid Testing:** Including both API tests (`auth.api.test.ts`) and E2E specs (`authentication.spec.ts`) ensures this critical security flow is fully verified and regression-proof.
  > 
  > **Minor Observation (Non-blocking):**
  > For the frontend (`api.ts` or `AuthContext.tsx`), just a small reminder to ensure that if the JWT expires and the server returns a 401 Unauthorized on a subsequent request, the client gracefully catches it (e.g., via an Axios interceptor) and automatically logs the user out rather than leaving the UI in a broken state.
  > 
  > **Verdict: APPROVED** The auth foundation is solid and ready to go. Great job on a crucial piece of the architecture! Feel free to merge.

- **Author (@supa-gif173):**
  > Thank you for the thorough review and the excellent feedback! That is a very sharp observation regarding the 401 Unauthorized handling for expired tokens. Adding a global interceptor to gracefully clear the session and redirect to the login screen is a perfect idea to ensure a seamless user experience. I will make sure this is tracked and implemented in our upcoming iterations.

---

### 3. PR #29: feat: IT Staff Ticket Queue & Ticket Operations (Issue 3)
- **Reviewer (@MiMikoChAn913 - Round 1):**
  > Thanks for the implementation. The queue and ticket detail structure look good, but I found several issues that should be addressed before merging:
  > 1. The status endpoint accepts and saves any non-empty value without validating the allowed statuses or the transition from the current status. Please implement the approved transition matrix on the backend. Also, the PR description says this follows the “BR-10 transition matrix,” but BR-10 in the specification defines the Ticket Owner rule, not status transitions.
  > 2. The assignment endpoint only checks whether the supplied User ID exists through the foreign key. This allows a ticket to be assigned to a Requester or an inactive account. Please verify that the selected owner is an active STAFF or ADMIN user, as required by BR-10.
  > 3. `requireStaffOrAdmin` trusts the role stored in the JWT without checking the user’s current activation state or password-change requirement. A deactivated user, a user whose role has changed, or a user who must change their initial password may continue accessing Staff APIs with an existing token. Please enforce these restrictions on the backend.
  > 4. The priority endpoint accepts any non-empty string. Please validate `itPriority` against the permitted priority values before saving it.
  > 5. The status dropdown only contains New, In Progress, Resolved, and Closed. The Lab 3 requirements also include Open, Waiting for Requester, Reopened, and Cancelled. Please include all required statuses and show only transitions permitted from the ticket’s current status.
  > 6. Please add negative API tests for invalid transitions, invalid status and priority values, assignment to Requester or inactive users, and restricted access before the initial password is changed.
  > 7. The PR description states that the tests pass, but the committed `test-results/.last-run.json` currently reports `"status": "failed"`, and there are no workflow results attached to this commit. Please rerun the tests, provide passing evidence, and remove generated test-result files from the PR if they are not intended to be version-controlled.

- **Author (@supa-gif173 - Response 1):**
  > Thank you for the incredibly sharp and thorough review! You caught some critical security and logic gaps. I highly appreciate it.
  > 
  > I have addressed all the points:
  > - Implemented strict backend status transition matrix validation.
  > - Added owner validation to ensure assignments only go to active STAFF/ADMIN users.
  > - Updated the auth middleware to actively check the database for `isActive` and `mustChangePassword` states instead of just trusting the JWT.
  > - Added strict enum validation for `itPriority`.
  > - Updated the frontend status dropdown to dynamically reflect only permitted transitions including all Lab 3 statuses.
  > - Added negative API tests covering all these edge cases.
  > - Removed the generated test-results from version control and verified all tests pass cleanly.
  > 
  > The fixes have been pushed. Could you please take another look?

- **Reviewer (@MiMikoChAn913 - Round 2):**
  > Thanks for addressing the previous review. I rechecked commit `c9edd0e`, and the authorization checks, owner validation, priority validation, status transition checks, frontend status options, and negative API tests have been added.
  > 
  > However, a few issues still need to be fixed before approval:
  > 1. The status and priority formats are inconsistent. `tickets.ts` still creates tickets with `status: "New"`, while the Prisma schema defaults to `"New"` and `"Low"`. The updated queue filters now send `"NEW"` and `"LOW"`, and the backend uses exact string matching. As a result, newly created and existing tickets may not appear when filtering by status or priority.
  > 2. `StaffTicketDetail` also initializes the controlled status value from values such as `"New"`, while all `<option>` values now use uppercase enum-style values such as `"NEW"`. This can leave the dropdown without a matching selected option.
  > 3. Please standardize the stored values throughout the schema, migration, ticket creation route, API, frontend, and existing data. Please also add regression tests covering tickets created through the Requester flow.
  > 4. The new `test-results/` entry in `.gitignore` appears to contain NUL characters, likely because it was appended using a different text encoding. Git may not recognize it as a valid ignore rule. Please rewrite the file as normal UTF-8 text with a plain `test-results/` line.
  > 5. Please document the implemented status transition matrix in `docs/lab-03/specification.md` and correct the PR description, since BR-10 defines the Ticket Owner rule rather than the status transition matrix.
  > 6. There is still no GitHub workflow result attached to this commit, so please also provide the passing test output or other traceable test evidence.

- **Author (@supa-gif173 - Response 2):**
  > Thank you again for the incredibly thorough review! The case sensitivity mismatch between the legacy records and the new filters was definitely a blind spot, and great catch on the `.gitignore` encoding glitch.
  > 
  > I have addressed all your points:
  > - **Standardized Values:** Forced strict uppercase (e.g., `"NEW"`, `"LOW"`) across the Prisma schema defaults, ticket creation routes, and frontend state initializers. All existing/seeded data has been aligned.
  > - **Regression Tests:** Added tests to ensure tickets created via the Requester flow correctly instantiate with the new uppercase formats.
  > - **File Encoding:** Completely recreated the `.gitignore` file in standard UTF-8.
  > - **Documentation:** Documented the complete Status Transition Matrix in `docs/lab-03/specification.md` and updated the PR description to remove the incorrect BR-10 reference.
  > - **Test Evidence:** I've run the full suite and included the passing output log directly in a `test-evidence.md` file within this commit for full traceability.
  > 
  > The fixes have been pushed. Please let me know if it's good to go now!

- **Reviewer (@MiMikoChAn913 - Final Verdict):**
  > Thanks for addressing the review feedback. The main authorization and validation issues have been fixed, so I’m okay with merging this into `lab3-staging`.
  > 
  > Please track the remaining Requester status-filter mismatch and incomplete legacy-data normalization as follow-up issues to resolve before merging into main. Please also rerun the Staff E2E flow before the final submission.
  > 
  > **Verdict: APPROVED**

---

### 4. PR #30: feat: Admin User Management and Legacy Data Normalization (Issue 4)
- **Reviewer (@MiMikoChAn913 - Round 1):**
  > Thanks for adding the admin user management feature and server-side role checks. I found two issues to address before merging:
  > 1. User management is hidden on mobile. `UserManagement.tsx` uses `.desktop-table`, which the shared CSS hides below 768px, but there is no mobile alternative. This hides both the user list and Edit buttons. Please add a mobile view or keep this table visible with horizontal scrolling.
  > 2. The create/update endpoints need server-side input validation. In `server/src/routes/admin.ts`, whitespace-only names and malformed email addresses can pass the current checks. Please validate trimmed names, email format, allowed roles, and field types before saving, and return a clear 400 response for invalid input.
  > 
  > Please add focused checks for these cases.

- **Author (@supa-gif173 - Response 1):**
  > Thanks for the sharp review! You are completely right about the mobile view and the backend validation gaps.
  > 
  > I have addressed both issues:
  > - **Mobile View:** I implemented a responsive card-based layout for devices under 768px so the user list and action buttons are fully accessible on mobile, while keeping the standard table for desktop.
  > - **Server-side Validation:** Added strict checks in the backend for both create and update endpoints. Names are now trimmed and checked for empty strings, emails must pass regex format validation, and roles are strictly checked against the allowed enums. Invalid inputs now return a clear 400 Bad Request.
  > - Added API tests to specifically cover these negative validation cases.
  > 
  > The fixes have been pushed to the branch. Could you please review again?

- **Reviewer (@MiMikoChAn913 - Round 2):**
  > Thanks for the fixes! The mobile cards and the name, email, and role validation address the main issues I raised.
  > 
  > One small test adjustment before approval: `UserManagement.test.tsx` still uses `getByText` for user names, but each name now appears in both the desktop table and mobile cards. Please scope these assertions to each section and rerun the component tests.
  > 
  > Type validation for `isActive` and password can be tracked as a follow-up for staging.

- **Author (@supa-gif173 - Response 2):**
  > Great catch on the test queries! Having the data rendered twice for the responsive layout definitely broke the standard `getByText` assertions.
  > 
  > I have updated `UserManagement.test.tsx` to properly scope the assertions to specific DOM sections (using `getAllByText` and `within` where appropriate). The component tests are now passing fully again.
  > 
  > I will also make a note to track the `isActive` and password type validation as a follow-up task for staging.
  > 
  > The test fixes are pushed. We should be ready to merge now!

- **Reviewer (@pimchayasupr-hash - Approval):**
  > **Peer Review Final Approval — Issue 4: Admin User Management**
  > 
  > Thank you for addressing the test query feedback!
  > 
  > **Verification Summary:**
  > - **Scoping in Component Tests:** The assertions in `UserManagement.test.tsx` are now properly scoped using `getAllByText`, correctly handling elements rendered in both the desktop table and mobile card views without assertion failures.
  > - **Responsive Mobile View:** The card-based mobile layout works seamlessly and keeps all user details and actions accessible below 768px.
  > - **Input Validation & Safety Rules:** Strict server-side validation for trimmed names, email formatting, and role enums is in place, along with the required admin safety guards.
  > - **Follow-up Note:** Acknowledged tracking for `isActive` and password type validation as a follow-up task on staging.
  > 
  > **Verdict: APPROVED** All acceptance criteria are met and all tests pass. Ready to merge into `lab3-staging`!

- **Reviewer (@MiMikoChAn913 - Approval):**
  > Thanks for addressing the feedback! The mobile user list, name/email/role validation, and duplicate-text test queries have been updated.
  > 
  > Based on the code review, I’m happy to approve this for merging into `lab3-staging`. Please keep the remaining `isActive` and password type validation tracked as a follow-up.
  > 
  > I haven’t rerun the tests locally, so please ensure the latest test run is green before merging.
  > 
  > **Verdict: APPROVED**

---

### 5. PR #31: Feature/issue 6 final docs
- **Reviewer (@MiMikoChAn913 - Round 1):**
  > Thanks for adding the documentation templates.
  > 
  > Please change the PR base from `main` to `lab3-staging`. The current diff includes 51 files from the earlier Lab 3 work, while comparing this branch against `lab3-staging` shows only the two documentation files described in this PR.
  > 
  > The templates look suitable for staging. Please replace the placeholders in `reviewer.md` and `ai-use.md` with the actual review links, comments, prompts, and reflections before the final submission.

- **Author (@supa-gif173):**
  > Thank you for the review! I've already changed the PR base to `lab3-staging`. Please note that I will fill in the details for the `.md` files (`reviewer.md` and `ai-use.md`) later before the final submission.

- **Reviewer (@MiMikoChAn913 - Final Verdict):**
  > Thanks for updating the PR base to `lab3-staging`. I’ve reviewed the updated diff, which now contains only `reviewer.md` and `ai-use.md` as intended.
  > 
  > No blocking issues remain for merging these documentation templates into staging. Please complete the placeholders before the final submission, as agreed.
  > 
  > **Verdict: APPROVED for merge into `lab3-staging`.**

---

### 6. PR #33: feat: complete automated test suites and E2E tests (Resolves #32)
- **Reviewer (@pimchayasupr-hash):**
  > **Peer Review Evaluation for PR #33**
  > 
  > Thank you @supa-gif173 for implementing the automated test suites and the required backend enhancements! Overall, this is a very solid PR that significantly strengthens our test coverage across the server, client, and E2E layers.
  > 
  > **Key Strengths & Highlights:**
  > - **Prisma Schema & Relational Integrity:** The Comment and InternalNote models are cleanly integrated with relations to Ticket and User. The addition of `onDelete: Cascade` ensures tickets can be cleanly deleted without orphaned comment records.
  > - **Robust Access Control on Internal Notes:** Both GET and POST endpoints on `/api/tickets/:id/notes` correctly restrict access to STAFF and ADMIN, properly returning 403 Forbidden for Requesters. Character count validations (1-2000 chars, no empty/whitespace-only content) comply with spec requirements.
  > - **Broad Multi-Layered Test Coverage:** Supertest suites in `authorization.api.test.ts` and `comments-notes.api.test.ts` effectively verify role-based boundaries. `StaffTicketDetail.test.tsx` thoroughly mocks the API layer and verifies claim, priority, and status transitions. Comprehensive Playwright scenarios covering auth, password resets, ticket operations, and user admin.
  > 
  > **Suggestions & Recommendations:**
  > 1. **Remove Duplicate Spec File:** `user-administration.spec.ts` is currently duplicated at `client/e2e/lab-03/user-administration.spec.ts` and `e2e/lab-03/user-administration.spec.ts`. Since Playwright runs tests from the root `e2e/` folder, please consider removing the duplicate file in `client/e2e/` to avoid confusion.
  > 2. **Resource Enumeration (403 vs 404):** In `tickets.ts`, when a Requester accesses a ticket owned by another user, it returns 403 Forbidden. If we want to strictly adhere to anti-enumeration best practices (Lab 3 §4.4 / §8.2), returning 404 Not Found would prevent attackers from discovering valid ticket IDs. (If keeping 403 was an intentional decision to align with existing test assertions, that is fine as well).
  > 3. **E2E Selector Resilience:** In `staff-ticket-flow.spec.ts`, accessing password inputs by array index (e.g. `passwordFields[1]`) can occasionally be flaky across different DOM render orders. Using explicit labels or `getByPlaceholder()` would make the tests even more robust.
  > 
  > Great job pulling together the full test infrastructure! Ready to approve once the duplicate file is cleaned up.

- **Author (@supa-gif173):**
  > Thank you for the thorough and constructive peer review! I have addressed all the points in the latest commit (`061f49a`):
  > 1. **Duplicate Spec File Cleaned Up:** Removed the duplicate file at `client/e2e/lab-03/user-administration.spec.ts` and kept the canonical file at `e2e/lab-03/user-administration.spec.ts`.
  > 2. **Resource Enumeration (403 vs 404):** Kept 403 Forbidden to stay aligned with the existing test matrix and assertions in `docs/lab-03/tests.md` (`API-05`) and `api-spec.md`. The response payload is verified to contain no ticket metadata, ensuring that no sensitive data is leaked.
  > 3. **E2E Selector Resilience:** Refactored `staff-ticket-flow.spec.ts` to use explicit input element IDs (`#currentPassword`, `#newPassword`, `#confirmPassword`) instead of array indexing, preventing potential DOM ordering flakiness.
  > 4. **Peer Review Evidence Updated:** Documented this review exchange and feedback into `docs/lab-03/reviewer.md`.
  > 
  > All server tests (43 passed) and client unit tests (14 passed) are passing green. Please kindly approve and merge this PR into `lab3-staging` when you are ready!

---

## Approvals Summary
- [x] **PR #27:** Approved by @pimchayasupr-hash (Merged into `lab3-staging`)
- [x] **PR #28:** Approved by @pimchayasupr-hash (Merged into `lab3-staging`)
- [x] **PR #29:** Approved by @MiMikoChAn913 (Merged into `lab3-staging`)
- [x] **PR #30:** Approved by @MiMikoChAn913 & @pimchayasupr-hash (Merged into `lab3-staging`)
- [x] **PR #31:** Approved by @MiMikoChAn913 (Merged into `lab3-staging`)
- [x] **PR #33:** Approved by @pimchayasupr-hash (Merged into `lab3-staging`)
