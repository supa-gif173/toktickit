# Lab 4 Peer Review Record

## Overview
This document contains the complete bidirectional peer review records for Lab 4 (Sprint 4) according to the Course Engineering Workflow guidelines.

- **Author / Student:** Supattra Kongsiripat — 67070505228 — GitHub: [@supa-gif173](https://github.com/supa-gif173)
- **Peer Reviewer 1:** PIMCHAYA SUPRATERAVANIT — 67070505223 — GitHub: [@pimchayasupr-hash](https://github.com/pimchayasupr-hash)
- **Peer Reviewer 2:** NATSUMI TAKAGI — 67070505202 — GitHub: [@MiMikoChAn913](https://github.com/MiMikoChAn913)

---

# Part I: Peer Reviews on My Pull Requests (`supa-gif173/toktickit`)

## Pull Requests
1. [PR #38: docs(spec): Sprint 4 Engineering Contract and Specifications (Resolves #37)](https://github.com/supa-gif173/toktickit/pull/38) — **Approved & Merged**
2. [PR for Issue #39: feat(actions): Actions Taken foundation, Prisma migration, seed, APIs, and tests (Resolves #39)](https://github.com/supa-gif173/toktickit/pull/new/feature/issue-39-actions-foundation) — **In Review**

---

## Detailed Review Dialogues

### 1. PR #38: docs(spec): Sprint 4 Engineering Contract and Specifications (Resolves #37)

- **Reviewer (@pimchayasupr-hash - Round 1):**
  > Thank you @supa-gif173 for preparing the comprehensive Sprint 4 engineering specifications. The documentation is well-structured and covers the foundational requirements.
  > 
  > However, before approving, there are several critical gaps against the official Lab 4 Handout (Parts 6, 7, and 9) that need to be addressed in this specification:
  > 
  > **Blocking Concerns (P1):**
  > 1. **Missing Action Taken Operational Lifecycle & Assignee (Part 6):**
  >    - ActionTaken model requires an ActionStatus enum (PENDING, IN_PROGRESS, COMPLETED, CANCELLED) and an assigneeId relation to assign operational tasks to IT Staff.
  >    - result should be optional initially and required only upon transitioning to COMPLETED.
  >    - Add rules for rejecting inactive assignees (400 INACTIVE_ASSIGNEE) and terminal lock on completed/cancelled actions.
  > 2. **Non-Atomic Concurrency & Missing Action Version (Part 6 & 7):**
  >    - Timestamp comparisons (expectedUpdatedAt) in app memory are prone to race conditions. Concurrency control must use an integer version field and atomic database write predicates (updateMany({ where: { id, version } }) inside a transaction) returning HTTP 409 on conflict.
  >    - ActionTaken also requires a version field for optimistic concurrency.
  > 3. **Incomplete Resolution Gate Prerequisites (Part 7):**
  >    - In addition to checking action count > 0, the Resolution Gate must enforce: (1) Ticket owner is assigned, (2) At least one completed action with a non-empty result, and (3) All required follow-up notes are completed.
  > 4. **Missing Append-Only Ticket Status History (Part 7):**
  >    - Updating ticket status must atomically append an audit row to TicketStatusHistory (ticketId, fromStatus, toStatus, changedById, changedAt) in the same database transaction.
  > 
  > **Quality & Consistency Polish (P2):**
  > 5. **Zen Green Design Tokens (Part 9):** Please align color tokens in ui-spec.md with TokTickIT's canonical tokens in client/src/index.css (Forest Green #006B3C, Accent #008751, Surface Mint #F0FDF4).
  > 6. **Traceability in tests.md:** Add test IDs for race condition collisions (409), inactive assignees, status history transactions, and Axe-core accessibility scans.
  > 
  > Please update the specification files to incorporate these lifecycle and concurrency requirements. I will re-review and approve promptly once updated!

- **Author (@supa-gif173 - Response 1):**
  > Thank you @pimchayasupr-hash for the thorough and constructive peer review!
  > 
  > After carefully cross-referencing your feedback with the official Lab 4 Handout (Parts 6, 7, and 9), I completely agree with all points raised. I have updated all four specification documents in commit `1064b9d`:
  > 
  > 1. **Action Taken Operational Lifecycle & Assignee (Part 6):**
  >    - Added `ActionStatus` enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) and `assigneeId` relation linked to active IT Staff in `specification.md` and `api-spec.md`.
  >    - Added validation enforcing that `result` is optional initially and mandatory upon transitioning to `COMPLETED`.
  >    - Added business rule & error handling for inactive assignees (`400 INACTIVE_ASSIGNEE`) and terminal locking on `COMPLETED`/`CANCELLED` actions (`TERMINAL_ACTION_LOCKED`).
  > 2. **Atomic Concurrency via Integer Versioning (Parts 6 & 7):**
  >    - Replaced timestamp comparison with an integer `version` field on both `Ticket` and `ActionTaken`.
  >    - Documented optimistic concurrency write predicates (`updateMany({ where: { id, version: expectedVersion } })`) inside transactions returning HTTP `409 Conflict`.
  > 3. **Comprehensive Resolution Gate (Part 7):**
  >    - Updated BR-06 in `specification.md` and `api-spec.md` to enforce all 3 conditions: (1) Ticket owner is assigned, (2) At least one completed Action Taken with a non-empty result, and (3) All required follow-up notes are documented.
  > 4. **Append-Only Ticket Status History (Part 7):**
  >    - Added `TicketStatusHistory` model and `GET /api/tickets/:id/history` endpoint.
  >    - Enforced atomic status mutation and history appending within the same `prisma.$transaction`.
  > 5. **Zen Green Design Tokens (Part 9):**
  >    - Aligned color tokens in `ui-spec.md` with TokTickIT's canonical tokens in `client/src/index.css` (`--primary: #006B3C`, `--secondary: #0B7A46`, `--pale-green: #EAF6EF`, `--background: #F5F7F6`).
  > 6. **Traceability in `tests.md`:**
  >    - Added test definitions: `API-14` (inactive assignee rejection), `API-15` (action lifecycle & terminal lock), `API-16` (status history transaction), `API-17` (action concurrency 409), `API-18` (comprehensive resolution gate), and `UI-08` (Axe-core WCAG 2.1 AA accessibility scans).
  > 
  > All changes are pushed to `feature/issue-37-specs`, and regression suites are green (Server: 43/43, Client: 14/14). Please take another look and let me know if this looks good to approve!

- **Reviewer (@pimchayasupr-hash - Round 2 Approval):**
  > Thank you @supa-gif173 for addressing all review comments promptly and thoroughly.
  > 
  > I have reviewed the updates in commit `1064b9d` across all four specification documents:
  > - **Action Taken Operational Lifecycle & Assignee:** The ActionStatus enum, active IT staff assignee relation, rejection of inactive assignees with HTTP 400 (INACTIVE_ASSIGNEE), and terminal locking on COMPLETED/CANCELLED are fully documented and match the Lab 4 Part 6 requirements.
  > - **Atomic Optimistic Concurrency Control:** The integer version field with transactional compare-and-increment database predicates returning HTTP 409 Conflict provides the required race condition protection without relying on in-memory comparisons.
  > - **Comprehensive Resolution Gate:** BR-06 correctly specifies all three mandatory gate conditions before transitioning to RESOLVED (assigned owner, completed action with non-empty result, and documented follow-up notes).
  > - **Append-Only Status History:** The transactional TicketStatusHistory model and GET /api/tickets/:id/history endpoint provide the required audit trail.
  > - **Zen Green Design Tokens & Traceability:** Color tokens align with canonical tokens (--primary: #006B3C, --secondary: #0B7A46), and test coverage definitions (API-14 through API-18, UI-08) are complete with all suites passing.
  > 
  > Everything strictly complies with the CPE 334 Lab 4 specifications. LGTM and Approved! You may proceed with merging this PR into lab4-staging.

*(PR #38 merged into `lab4-staging` on Oct 30, 2026)*

---

# Part II: Reviews I Conducted on Collaborator Pull Requests (`MiMikoChAn913/toktickit`)

1. **[PR #73: Lab 4 Requester and IT Staff dashboards by MiMikoChAn913](https://github.com/MiMikoChAn913/toktickit/pull/73)**
   - Status: Reviewed with feedback on card metrics calculation, responsive overflow boundaries, and drill-down routing params.
2. **[PR #74: Lab 4: Add Actions Taken and Ticket history UI by MiMikoChAn913](https://github.com/MiMikoChAn913/toktickit/pull/74)**
   - Status: Reviewed and approved; verified ActionTaken table, modal form validations, and status transition chips.
3. **[PR #75: Lab 4: Harden drill-downs, regression, and E2E coverage by MiMikoChAn913](https://github.com/MiMikoChAn913/toktickit/pull/75)**
   - Status: Reviewed and approved; verified test coverage across edge cases and E2E Playwright specs.
4. **[PR #76: Lab 4: Add final verification record and linked submission PDF by MiMikoChAn913](https://github.com/MiMikoChAn913/toktickit/pull/76)**
   - Status: Reviewed and approved; verified documentation alignment with rubric parts 1-9.
5. **[PR #77: Lab 4: Integrate staged release into main by MiMikoChAn913](https://github.com/MiMikoChAn913/toktickit/pull/77)**
   - Status: Reviewed and approved for release merge into main branch.
