# AI Use Reflection (Sprint 4)

**Student Name:** Supattra Kongsiripat  
**Student ID:** 67070505228  
**Repository:** [supa-gif173/toktickit](https://github.com/supa-gif173/toktickit)  
**LLM Used:** Google Antigravity (Gemini 3.1 Pro & Gemini 3.8 Flash)

---

## Selected Key Prompts

1. **Specification & Contract Formulation (Issue #37):**
   > "Based on the Lab 4 handout (Parts 1-9), decompose the stakeholder requirements into numbered Functional Requirements (FR-01 to FR-11), Business Rules (BR-01 to BR-13), and testable Acceptance Criteria (AC-01 to AC-14) covering Actions Taken parent-child structure, complete Ticket lifecycle, Resolution Gate, role-tailored Dashboards, atomic optimistic concurrency control (OCC), and Zen Green UI extensions."

2. **Peer Review Remediation & Architectural Alignment (Issue #37):**
   > "Review peer feedback on PR #38 from @pimchayasupr-hash. Update the engineering specifications to incorporate an explicit ActionStatus lifecycle (PENDING, IN_PROGRESS, COMPLETED, CANCELLED), an active IT Staff assigneeId relation (rejecting inactive assignees with 400 INACTIVE_ASSIGNEE), terminal locks on completed/cancelled actions, integer version fields with atomic database write predicates for OCC (409 Conflict), an append-only TicketStatusHistory model, and comprehensive Resolution Gate prerequisites."

3. **Database Schema, Migration & Idempotent Seed (Issue #39):**
   > "Design the Prisma schema increment for Lab 4 adding the ActionStatus enum, ActionTaken model, TicketStatusHistory audit model, and version fields on Ticket and ActionTaken. Provide an idempotent seed script that populates realistic tickets across all statuses, priorities, assigned/unassigned states, and multiple actions taken, fully preserving legacy data from Labs 1-3."

4. **Actions Taken REST APIs & Terminal Locking (Issue #39):**
   > "Implement REST API endpoints for Actions Taken (`POST /api/tickets/:id/actions`, `GET /api/tickets/:id/actions`, `PUT /api/tickets/:id/actions/:actionId`). Enforce that performedById is auto-populated from JWT, result is mandatory only upon transitioning to COMPLETED, inactive assignees return 400 INACTIVE_ASSIGNEE, terminal actions cannot be modified, and Requesters are restricted to read-only access for owned tickets (403 for other tickets)."

5. **Actions Taken Frontend UI & Modal Workflows (Issue #41):**
   > "Implement the Actions Taken section and Create/Edit Action modal in `client/src/pages/StaffTicketDetail.tsx` and `client/src/components/ActionsTaken.tsx`. Ensure full compliance with Zen Green design tokens (#006B3C, #008751, #F0FDF4), explicit SVG dimensions (<= 64px), zero emojis, keyboard accessibility, inline validation feedback, and clean read-only rendering for Requesters."

6. **Comprehensive Resolution Gate & Transactional History (Issue #43):**
   > "Implement server-side status transition validation and the 4-condition Resolution Gate in `server/src/routes/staff.ts`. Block transitions to RESOLVED unless: (1) ticket has an assigned owner, (2) at least one ActionTaken exists, (3) at least one ActionTaken is COMPLETED with a non-empty result, and (4) all follow-up notes are documented. Atomically append a TicketStatusHistory row inside the same `prisma.$transaction` and return 409 Conflict on version mismatch."

7. **Requester Advisory Resolution Indicator (Issue #43):**
   > "Implement `PATCH /api/tickets/:id/resolve-indicator` allowing Requesters to toggle `problemAppearsResolved` without mutating the authoritative ticket status. Enforce ownership verification (403 Forbidden for non-owners) and verify isolation in both API and UI."

8. **Authoritative Role-Tailored Dashboard APIs (Issue #45):**
   > "Implement `GET /api/dashboard/requester` and `GET /api/dashboard/staff` in `server/src/routes/dashboard.ts`. Aggregate operational metrics (triage ribbon, priority breakdown via prisma.ticket.groupBy, recent queue tickets, rolling 30-day resolved count, and system user stats for ADMIN). Enforce `requireStaffOrAdmin` guard returning 403 Forbidden for unauthorized Requesters."

9. **Automated Accessibility Testing with Axe-core (Issue #47):**
   > "Write an automated accessibility scan in `client/tests/lab-04/A11yScan.test.tsx` using `axe-core`. Test RequesterDashboard, StaffDashboard, ActionsTaken, and TicketHistory timeline components to assert zero critical or serious WCAG 2.1 AA violations, satisfying UI-08 / AC-14."

10. **Database Telemetry Parity Verification (Issue #47):**
    > "Write a verification script `scripts/generate_metrics_vs_db.js` that concurrently queries the live REST API dashboard endpoints and executes direct raw PostgreSQL queries, comparing every metric count and generating `artifacts/lab-04/metrics-vs-db.txt` with zero divergence."

---

## My Reflection

### Specification-Agent Use
Throughout Sprint 4, the AI specification agent served as a rigorous architectural partner. Rather than jumping straight into code, using the agent to decompose the stakeholder's high-level request into numbered Functional Requirements (FR-01 through FR-11), Business Rules (BR-01 through BR-13), and measurable Acceptance Criteria (AC-01 through AC-14) established a single source of truth for the entire team. 

The greatest value of the specification agent was demonstrated during Round 1 of our peer review on PR #38. When our collaborator (@pimchayasupr-hash) identified critical gaps regarding the Action Taken operational lifecycle, atomic OCC predicates, and append-only audit history, the specification agent helped systematically evaluate each requirement against the Lab 4 handout, update all four specification documents (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`), and maintain strict bidirectional traceability before a single line of backend implementation was merged.

### Coding-Agent Use
The AI coding agent dramatically accelerated full-stack delivery while maintaining high engineering discipline. Key accomplishments include:
1. **Database & Transactional Integrity:** The agent accurately structured Prisma schema increments and ensured that state transitions and audit logging occurred within atomic `prisma.$transaction` blocks with optimistic concurrency version checking.
2. **Design System & Guardrails:** The agent consistently adhered to TokTickIT's Zen Green color tokens, eliminated all emojis in favor of semantic Lucide SVG icons with explicit dimensional bounds (<= 64px), and prevented horizontal overflow across mobile, tablet, and desktop viewports.
3. **Multi-Layered Testing Rigor:** The agent implemented comprehensive test coverage across Server API integration tests (68/68 passing), Client React Testing Library component tests (29/29 passing), Playwright E2E suites, and automated `axe-core` accessibility scans.

Overall, Sprint 4 proved that combining specification-driven development with AI-assisted implementation, strict peer review gates, and automated test-driven verification produces robust, production-grade software that fully satisfies stakeholder requirements and academic rubrics.
