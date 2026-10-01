# AI Use Reflection (Sprint 3)

**LLM Used:** Google Antigravity (Gemini 3.1 Pro & Gemini 3.8 Flash)

## Selected Key Prompts

1. **Specification & Contract Formulation:**
   > "Based on the Lab 3 handout, decompose the stakeholder requirements into numbered Functional Requirements (FR-01 to FR-07), Business Rules (BR-01 to BR-13), and testable Acceptance Criteria (AC-01 to AC-06) covering Authentication, IT Staff Queue, Ticket Operations, and Administrator User Management."

2. **Database Schema & Migration Strategy:**
   > "Design a Prisma schema increment that evolves the Lab 2 schema into a secure User model with roles (REQUESTER, STAFF, ADMIN), hashed passwords, activation state, and first-login password change flags, preserving existing Category, System, and Ticket records."

3. **Status Transition Matrix Implementation:**
   > "Implement server-side status transition validation for tickets according to the Lab 3 specification matrix (e.g., NEW -> OPEN, IN_PROGRESS, CANCELLED; RESOLVED -> CLOSED, REOPENED; preventing invalid status jumps) and return 400 Bad Request on illegal transitions."

4. **Role-Based Authentication & Authorization Middleware:**
   > "Write Express middleware (`requireAuth`, `requireStaffOrAdmin`, `requireAdmin`) using HTTP-only JWT cookies that validates account active status, enforces mandatory password changes before accessing application routes, and protects staff/admin endpoints."

5. **Resource Isolation & Anti-Enumeration Protection:**
   > "Implement ticket detail authorization such that Requesters can only access their own tickets and client-supplied `requesterId` cannot override the authenticated user identity (BR-03, AC-03). Ensure no ticket summary or metadata is leaked on unauthorized requests."

6. **Public Comments vs. Restricted Internal Notes:**
   > "Create Prisma models and REST API routes for Public Comments and Internal Notes on tickets. Enforce that Public Comments are visible to Requester and Staff, while Internal Notes are strictly restricted to IT Staff and Administrators (403 Forbidden for Requesters)."

7. **Zen Green UI & Mobile Responsive Layouts:**
   > "Design the Administrator User Management screen and IT Staff Ticket Queue reusing Zen Green CSS tokens, featuring search, filter, modal forms, and responsive mobile-card views to prevent horizontal overflow on smaller viewports."

8. **Peer Review Remediation & Test Resilience:**
   > "Review peer feedback on PR #33. Refactor Playwright E2E test selectors in `staff-ticket-flow.spec.ts` from array index lookups to explicit element IDs (`#currentPassword`, `#newPassword`), remove duplicate spec files, and verify all suites pass."

---

## My Reflection

### Specification-Agent Use
Using the AI specification agent at the beginning of Sprint 3 proved essential for breaking down ambiguous stakeholder descriptions into precise, numbered requirements (FRs, BRs, and ACs). The agent was particularly helpful in establishing the ticket status transition matrix and mapping each requirement directly to planned test cases in `tests.md` before writing code. This contract-driven approach prevented scope creep and ensured that security considerations—such as separating Public Comments from Internal Notes and preventing client spoofing of `requesterId`—were clearly defined up front.

### Coding-Agent Use
The coding agent significantly accelerated full-stack implementation across Express, Prisma, React, and automated testing tools (Vitest and Playwright). It excelled at writing boilerplate-heavy components, generating idempotent seed scripts, and creating multi-layered test suites that validated both positive paths and edge-case security failures. More importantly, when our peer reviewer (@Natsumi) suggested improving test selector resilience and removing duplicate files, the coding agent quickly refactored the code and updated the peer review evidence document. Overall, the pairing demonstrated that AI agents are most effective when guided by strict architectural contracts, comprehensive automated test suites, and staged peer review workflows.
