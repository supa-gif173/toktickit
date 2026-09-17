# Sprint 3 Engineering Specification

## 1. Sprint Goal
The goal of this sprint is to transition the TokTickIT application from a temporary development environment to a secure, role-based system. This involves implementing real authentication, replacing the temporary Requester selector, introducing an operational IT Staff Ticket Queue and Ticket Detail workflow, and building a minimalist Administrator User Management interface, ensuring strict data ownership and access control across three user roles: Requester, IT Staff, and Administrator.

## 2. Stakeholder Request
The stakeholders require real user authentication and authorization to replace the temporary development setup. Requesters must log in securely and continue managing their tickets with data ownership protection. IT Staff need a professional interface to view a queue of tickets, manage assignments, update ticket status and priority, and communicate through public and internal notes. Administrators need a simple interface to manage user accounts, assign roles, and handle initial passwords. The application must enforce strict role-based access for all actions and data, maintaining the existing Zen Green design language.

## 3. Scope
**Included:**
- Secure email and password authentication, logout, and mandatory first-login password change.
- Server-side role-based authorization for Requester, IT Staff, and Administrator.
- Migration of Development Requester identity to the authenticated User model.
- Requester ownership protection for all Lab 2 Ticket and Attachment functions.
- IT Staff Ticket Queue, Ticket Detail, ownership assignment, IT Priority management, Public Comments, Internal Notes, and status workflow updates.
- Minimalist Administrator User Management (list, create, edit basic info, single role assignment, activation/deactivation, new initial password).
- Data model evolution and REST API extensions.
- Zen Green UI extensions.

**Explicitly Excluded:**
- Email invitations, password-reset emails, MFA, social login, SSO.
- Self-registration and Requester-created accounts.
- Actions Taken by IT Staff.
- SLA calculation, escalation rules, notifications.
- Advanced dashboards and KPI analytics.
- Multi-tenant organizations, departments, multi-role assignments.
- Production-grade deployment or cloud infrastructure changes.
- User deletion, bulk operations, user import/export, account history, profile photos.
- Account unlocking, admin approval workflows.
- Mandatory pagination, multi-column sorting, multiple simultaneous filters in user lists.

## 4. Functional Requirements
*   **FR-01 (Authentication):** The system shall provide secure login, logout, and current-user retrieval functionalities using email and password.
*   **FR-02 (Password Change):** The system shall force users to change their initial password upon their first successful login before accessing other application features.
*   **FR-03 (Role-Based Authorization):** The system shall enforce role-based access control (Requester, IT Staff, Administrator) on all APIs and UI navigation, protecting data and actions appropriately.
*   **FR-04 (Requester Features):** The system shall allow Requesters to create, view, and manage only their own Tickets and Attachments, post Public Comments, and indicate that a problem appears resolved.
*   **FR-05 (IT Staff Queue):** The system shall provide IT Staff with a Ticket Queue featuring search, suitable filters, sorting, and pagination.
*   **FR-06 (IT Staff Ticket Operations):** The system shall allow IT Staff to view ticket details, claim or reassign ownership, set IT Priority, update permitted statuses, post Public Comments, and write Internal Notes.
*   **FR-07 (Administrator User Management):** The system shall provide Administrators with a minimalist interface to list users (with search and optional role filter), create users, edit basic account info, assign one role, activate/deactivate accounts, and set new initial passwords.

## 5. Business Rules
*   **BR-01:** Only an active user with valid credentials may authenticate.
*   **BR-02:** A user marked as requiring a password change cannot enter the normal application until a new valid password is saved.
*   **BR-03:** The authenticated user identity, not a requesterId supplied by the client, determines ownership of Requester operations.
*   **BR-04:** Public Comments are visible to the Requester, IT Staff, and Administrator. Internal Notes are visible only to IT Staff and Administrator.
*   **BR-05:** A Requester may indicate that the problem appears resolved, but cannot formally set the Ticket to Resolved or Closed.
*   **BR-06:** An Administrator cannot deactivate their own account.
*   **BR-07:** The system must prevent the removal or deactivation of the last active Administrator account.
*   **BR-08:** Users can only have one permitted role assigned (Requester, IT Staff, or Administrator).
*   **BR-09:** Duplicate email addresses are not permitted when creating or updating user accounts.
*   **BR-10:** Each Ticket may have zero or one primary Ticket Owner, who must be an active IT Staff or Administrator user.
*   **BR-11:** Requested Priority remains the value submitted by the Requester. IT Priority initially copies Requested Priority and may later be changed only by IT Staff or Administrator.
*   **BR-12:** Users must be deactivated instead of deleted.

## 6. UI Specification Summary
The UI will continue using the Zen Green design language established in Lab 2. New screens and modifications will blend seamlessly with the existing visual system. 
*   **Login & Password Change:** Secure login form with validation, busy states, and safe failure feedback. Mandatory password change screen enforcing password rules.
*   **Requester Regression:** Existing Requester screens work with authenticated identity. Development Requester selector removed. Public Comments added to Ticket Detail.
*   **IT Staff Ticket Queue:** Desktop table and mobile-friendly view with search, filters, sorting, pagination, clear ownership, and status.
*   **IT Staff Ticket Detail:** Clearly grouped information. Operational fields editable based on role. Visually distinct Public Comments and Internal Notes.
*   **Admin User Management:** Minimalist user list with search/filter, and a form for user creation and basic editing (activation state, role, initial password).
*   **General Rules:** Visible loading, saving, success, validation, empty, forbidden, and safe failure feedback across all screens.
For detailed specifications, see [ui-spec.md](ui-spec.md).

## 7. Data Changes
*   **Models:** Introduce a `User` model with fields for id, email, hashed password, name, role (Enum), isActive, and requiresPasswordChange.
*   **Relationships:** A User has one role. A Requester (User) owns many Tickets. A Ticket has zero or one primary Ticket Owner (User). A Ticket has many Public Comments and Internal Notes. A Comment/Note has one author (User).
*   **Migration:** Lab 2 Development Requesters must be migrated to the new User model. Existing tickets will be updated to point to the correct User IDs.
*   **Seed Decisions:** Seed idempotent data: 4 active/1 inactive Requesters, 3 active/1 inactive IT Staff, 1 active Administrator. Passwords will be securely hashed, never plaintext. Seed realistic tickets and comments.

## 8. API Contract
The REST API will be expanded to handle authentication, authorization, user management, IT Staff operations, and comments/notes. Endpoints will use HTTP cookies (or HttpOnly tokens) for secure session management. Every endpoint will enforce role-based access and ownership checks, returning proper 401 Unauthorized, 403 Forbidden, 404 Not Found, or 409 Conflict statuses. 
For exact endpoint paths, request/response shapes, and behaviors, see [api-spec.md](api-spec.md).

## 9. Acceptance Criteria
*   **AC-01:** Given an active user with valid credentials, when the user logs in, then the backend establishes authenticated access and returns the permitted user identity and role.
*   **AC-02:** Given a user who must change the initial password, when login succeeds, then normal application screens remain unavailable until a valid new password is saved.
*   **AC-03:** Given an authenticated Requester, when the client supplies another requesterId, then the backend still applies the authenticated identity and does not return another Requester’s data.
*   **AC-04:** Given a Requester account, when an Internal Note endpoint is requested, then the operation is rejected without exposing note content.
*   **AC-05:** Given an Administrator, when they attempt to deactivate their own account, the system rejects the operation and displays a validation error.
*   **AC-06:** Given an IT Staff user, when viewing the Ticket Queue, they can search by Ticket Number or Summary and optionally filter by status.

## 10. Definition of Done
*   [ ] Feature branch merged to staging and then main.
*   [ ] All ACs tested and met.
*   [ ] E2E and API tests pass on the main branch.
*   [ ] UI matches Zen Green design guidelines across desktop and mobile.
*   [ ] Secure session management implemented without exposing secrets.
*   [ ] Peer review completed and approved in GitHub.
*   [ ] README and documentation (including AI use reflection) updated.

## 11. Assumptions and Decisions
*   **Session Management:** JSON Web Tokens (JWT) stored in HTTP-only cookies will be used for session management to prevent XSS attacks while maintaining a stateless backend.
*   **Password Hashing:** `bcrypt` will be used for hashing user passwords securely.
*   **Comments/Notes Rendering:** Plain text with line breaks will be supported; HTML/Markdown will be sanitized if permitted, but strictly controlled to prevent XSS. Length limits (e.g., 2000 chars) will be enforced.
