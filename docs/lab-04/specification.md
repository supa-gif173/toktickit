# Sprint 4 Engineering Specification

## 1. Sprint Goal
The goal of Sprint 4 is to complete the core TokTickIT service-desk workflow by introducing a parent-child Actions Taken tracking structure under Tickets, enforcing the complete Ticket lifecycle and Resolution Gate, delivering role-appropriate Dashboards for Requesters, IT Staff, and Administrators, and hardening the entire application across all layers to ensure seamless regression behavior and full compliance with the Zen Green design system.

## 2. Stakeholder Request
The stakeholders require a reliable way to plan, log, and track the actual hands-on work performed on tickets. Each action must record the Action Date/Time, Action Description, Result, Performed by (auto-populated with authenticated user), Follow-Up Required flag, Follow-Up Note, and Attachment Notes. While a primary Ticket Owner coordinates the ticket, any IT Staff member can perform and record actions. Requesters may indicate that a problem appears resolved, but formal resolution requires IT Staff verification (Resolution Gate). Furthermore, concise role-appropriate dashboards must provide operational metrics and direct drill-down navigation for Requesters, IT Staff, and Administrators without duplicating detailed list views.

## 3. Scope
**Included:**
- Parent-child `ActionTaken` data model linked to Tickets and Users.
- Comprehensive Actions Taken management: view, create, and update actions by authorized roles.
- Read-only Actions Taken visibility for Requesters on their own tickets.
- Complete Ticket status lifecycle: `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, and `CANCELLED`.
- Resolution Gate enforcement: formal transition to `RESOLVED` requires IT Staff review and at least one documented Action Taken.
- Requester "Problem Appears Resolved" toggle treated as advisory feedback.
- Role-appropriate Dashboard interfaces for Requesters, IT Staff, and Administrators with authoritative backend metrics calculation.
- Drill-down navigation from dashboard metric cards to filtered ticket lists and ticket details.
- Optimistic concurrency and stale-update detection to prevent accidental overwrites during workflow status updates.
- Backward compatibility and idempotent seed data preserving all Lab 1, 2, and 3 data models and records.
- Zen Green UI extensions across Desktop, Tablet, and Mobile viewports with zero horizontal overflow.

**Explicitly Excluded:**
- Automatic SLA clocks, escalation engines, on-call scheduling, and breach notifications.
- Email, SMS, LINE, push, or external notification services.
- Inventory consumption, spare-parts management, purchasing, or cost accounting for services.
- Time-sheet billing, payroll, or detailed labor-cost calculation.
- Multi-level approval workflows and electronic signatures.
- Advanced business-intelligence tools, custom report builders, or external export data warehouses.
- Multi-tenant organizations and production-scale cloud infrastructure operations.
- New product features not approved in the Sprint 4 engineering contract.

## 4. Functional Requirements
* **FR-01 (Actions Taken Data Capture):** The system shall allow authorized IT Staff and Administrators to record Actions Taken under a Ticket, capturing Action Date/Time, Description, Result, Performed by (auto-populated), Follow-Up Required flag, Follow-Up Note (when required), and Attachment Notes.
* **FR-02 (Actions Taken Visibility):** The system shall allow Requesters to view all Actions Taken entries recorded on tickets they own, while strictly prohibiting Requesters from creating, modifying, or deleting actions.
* **FR-03 (Actions Taken Update):** The system shall allow IT Staff and Administrators to update existing Action Taken records on accessible tickets to document progress or append follow-up outcomes.
* **FR-04 (Complete Ticket Lifecycle):** The system shall support and enforce the complete Ticket status lifecycle consisting of `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, and `CANCELLED`.
* **FR-05 (Resolution Gate):** The system shall enforce that transitioning a Ticket to `RESOLVED` or `CLOSED` requires explicit IT Staff/Admin action and the presence of at least one recorded Action Taken demonstrating that substantive resolution work occurred.
* **FR-06 (Requester Resolution Indication):** The system shall allow Requesters to toggle an advisory indicator ("Problem Appears Resolved") on their own tickets without directly mutating the authoritative Ticket status.
* **FR-07 (Requester Dashboard):** The system shall provide Requesters with a concise dashboard displaying key personal metrics (My Open Tickets, Waiting on Me, Recently Updated, Recently Resolved) and quick-action navigation.
* **FR-08 (IT Staff & Admin Dashboard):** The system shall provide IT Staff and Administrators with an operational dashboard displaying triage metrics (Unassigned Tickets, Assigned to Me, Breakdown by Status, Breakdown by IT Priority, Recently Updated Tickets) with interactive drill-down links to filtered queue views.
* **FR-09 (Concurrency Protection):** The system shall detect stale or concurrent updates during ticket workflow operations and prevent silent overwrites by returning a 409 Conflict status.
* **FR-10 (Full System Regression & Hardening):** The system shall preserve all previously approved functionalities from Labs 1, 2, and 3, maintaining consistent error handling, busy states, accessible keyboard focus, and responsive Zen Green design.

## 5. Business Rules
* **BR-01 (Action Taken Parent-Child Integrity):** Each Action Taken belongs to exactly one Ticket. If a Ticket is deleted, all associated Action Taken records cascade delete.
* **BR-02 (Ownership vs. Action Responsibility):** The primary Ticket Owner coordinates the Ticket, but any active IT Staff member or Administrator may take action and log an Action Taken entry.
* **BR-03 (Action Taken Field Validation):**
  - `actionDateTime`: ISO date-time, defaults to the current timestamp. Cannot be in the future.
  - `description`: Plain text, mandatory, 1 to 2,000 characters. Whitespace-only content is rejected.
  - `result`: Plain text, mandatory, 1 to 2,000 characters. Whitespace-only content is rejected.
  - `performedById`: Populated automatically from the authenticated JWT session. Cannot be spoofed by client request payloads.
  - `followUpRequired`: Boolean flag, defaults to `false`.
  - `followUpNote`: Required when `followUpRequired` is `true` (1 to 1,000 characters). Must be null or empty when `followUpRequired` is `false`.
  - `attachmentNotes`: Optional plain text reference, up to 500 characters.
* **BR-04 (Action Taken Access Boundaries):** Requesters have read-only access to Actions Taken on their own tickets. Accessing Actions Taken for tickets owned by other users returns `403 Forbidden` (or `404 Not Found`). Only active IT Staff and Administrators may create or update Action Taken records.
* **BR-05 (Status Transition Matrix):** Ticket statuses must transition strictly according to the defined state machine:
  - **NEW:** &rarr; `OPEN`, `IN_PROGRESS`, `CANCELLED`
  - **OPEN:** &rarr; `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED`
  - **IN_PROGRESS:** &rarr; `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED`, `OPEN`
  - **WAITING_FOR_REQUESTER:** &rarr; `IN_PROGRESS`, `RESOLVED`, `CANCELLED`
  - **RESOLVED:** &rarr; `CLOSED`, `REOPENED`
  - **CLOSED:** &rarr; `REOPENED`
  - **REOPENED:** &rarr; `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED`
  - **CANCELLED:** Terminal state (no further transitions permitted).
* **BR-06 (Resolution Gate Rule):** A ticket cannot be transitioned to `RESOLVED` unless at least one valid `ActionTaken` record exists under that ticket. Any API request attempting to resolve a ticket without actions is rejected with `400 Bad Request`.
* **BR-07 (Advisory Requester Resolution):** A Requester's indication that the problem appears resolved is purely advisory; it sets `problemAppearsResolved = true` on the ticket record but does not change the ticket status to `RESOLVED`.
* **BR-08 (Requester Dashboard Metric Queries):**
  - `myOpenTickets`: Count of tickets where `requesterId = user.id` AND `status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED')`.
  - `waitingForRequester`: Count of tickets where `requesterId = user.id` AND `status = 'WAITING_FOR_REQUESTER'`.
  - `recentlyResolved`: Count of tickets where `requesterId = user.id` AND `status IN ('RESOLVED', 'CLOSED')` within the last 30 days.
  - `recentlyUpdatedTickets`: The 5 most recently updated tickets where `requesterId = user.id`.
* **BR-09 (IT Staff Dashboard Metric Queries):**
  - `unassignedTickets`: Count of active tickets (`status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED')`) where `ownerId IS NULL`.
  - `myAssignedTickets`: Count of active tickets where `ownerId = staff.id` AND `status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED')`.
  - `ticketsByStatus`: Aggregated counts grouped by `status` for all active tickets.
  - `ticketsByPriority`: Aggregated counts grouped by `itPriority` for all active tickets.
  - `recentQueueTickets`: The 5 most recently updated tickets across the entire service desk queue.
* **BR-10 (Admin Dashboard Scope):** The Administrator dashboard provides all IT Staff metrics plus summary counts of total users, active IT Staff members, and active Requesters.
* **BR-11 (Optimistic Concurrency Control):** Ticket status update requests must supply the ticket's `version` or `updatedAt` timestamp. If the record in the database has a newer timestamp than provided, the request is rejected with `409 Conflict`.
* **BR-12 (Data Backfill & Legacy Continuity):** Legacy tickets created in Labs 1-3 without Action Taken records remain valid. Dashboard calculations treat existing records accurately without errors.

## 6. UI Specification Summary
The user interface maintains complete fidelity to the Zen Green design system established in Labs 2 and 3.
* **Requester Dashboard:** A clean, card-based overview presenting metric counters (`My Open Tickets`, `Waiting on Me`, `Recently Resolved`), a quick-actions section (Create Ticket, View My Tickets), and a list of recently updated tickets with clickable rows.
* **IT Staff Dashboard:** An operational triage screen displaying top-level summary cards (`New`, `Open`, `In Progress`, `Waiting for Requester`, `My Assigned`), a quick-actions panel, and a recent tickets list with status and priority badges. Each card links directly to the Queue with pre-applied status filters.
* **Actions Taken Component (Ticket Detail):** Integrated directly into the existing Ticket Detail view below Attachments and Notes.
  - *List/Table Mode:* Displays Action Date/Time, Performed By, Description, Result, Follow-Up indicator, and Attachment Notes.
  - *Create Mode:* Modal or expandable form with real-time validation for Description, Result, and conditional Follow-Up Note.
  - *View/Edit Mode:* Modal displaying full action details, allowing IT Staff to update outcome descriptions.
  - *Requester View:* Read-only presentation; create/edit buttons are hidden and disabled.
* **Resolution Feedback & Transition Controls:** Dynamic dropdown showing only permitted transitions according to the Status Transition Matrix. When attempting resolution without an Action Taken, clear inline error feedback informs the user that an action record is required.
* **Responsive Layouts:** Desktop multi-column grid, Tablet responsive fluid containers, and Mobile stacked card layouts with zero horizontal scrollbars.
For detailed layout wireframes and token definitions, see [ui-spec.md](ui-spec.md).

## 7. Data Changes

### 7.1 Data Models & Relationships
Introduce the `ActionTaken` model in Prisma and link it to `Ticket` and `User`:
```prisma
model ActionTaken {
  id                Int      @id @default(autoincrement())
  ticketId          Int
  ticket            Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  performedById     Int
  performedBy       User     @relation("ActionsPerformed", fields: [performedById], references: [id])
  actionDateTime    DateTime @default(now())
  description       String
  result            String
  followUpRequired  Boolean  @default(false)
  followUpNote      String?
  attachmentNotes   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([ticketId])
  @@index([performedById])
}
```

Additions to `Ticket`:
- `actionsTaken ActionTaken[]`
- `problemAppearsResolved Boolean @default(false)`
- `updatedAt DateTime @updatedAt` (if not already present)

Additions to `User`:
- `actionsPerformed ActionTaken[] @relation("ActionsPerformed")`

### 7.2 Database Decisions & Justifications
1. **Cascade Deletion on Ticket Relation (`onDelete: Cascade`):** Actions Taken are subordinate child records of a Ticket. Deleting a ticket in a testing or maintenance workflow must cleanly remove its associated action history to prevent orphaned records and foreign key constraint violations.
2. **Conditional Validation via Application Layer instead of Database Constraints:** While `followUpRequired` is a boolean and `followUpNote` is a nullable text field, enforcing that `followUpNote` is populated when `followUpRequired` is true is managed within the Express route validation layer. This preserves flexibility across database engines (SQLite in local testing vs PostgreSQL in production) while strictly enforcing business integrity before database commits.
3. **Dedicated Performance Indexes on `ticketId` and `performedById`:** Since tickets frequently query their full action history and dashboards filter by staff user activity, foreign key indexes ensure fast retrieval and scalable join operations.

### 7.3 Seed Data Strategy
The seed script will be extended to:
- Be strictly idempotent (safe to run repeatedly using `upsert`).
- Create realistic Actions Taken across seeded tickets: tickets with zero actions (to test the resolution gate), tickets with one action, and tickets with multiple actions by different staff members.
- Ensure non-zero and zero counts for dashboard metrics across Requesters and IT Staff.

## 8. API Contract Summary
The REST API expands with new endpoints for Actions Taken and Dashboards, strictly secured by session cookies and role authorization:
- `GET /api/tickets/:id/actions`: Retrieve all Actions Taken for a ticket (Requester owner, Staff, Admin).
- `POST /api/tickets/:id/actions`: Create a new Action Taken record (Staff, Admin only).
- `PATCH /api/tickets/:ticketId/actions/:actionId`: Update an existing Action Taken (Staff, Admin only).
- `PATCH /api/tickets/:id/resolve-indicator`: Requester toggles problemAppearsResolved advisory flag (Requester owner only).
- `PATCH /api/staff/tickets/:id/status`: Update ticket status enforcing Status Transition Matrix, Resolution Gate, and concurrency checks (Staff, Admin only).
- `GET /api/dashboard/requester`: Retrieve authoritative Requester dashboard metrics (Requester only).
- `GET /api/dashboard/staff`: Retrieve authoritative IT Staff dashboard metrics (Staff, Admin only).

For exact schemas, request/response bodies, and HTTP status codes, see [api-spec.md](api-spec.md).

## 9. Acceptance Criteria
* **AC-01:** Given an authenticated IT Staff member and a valid accessible ticket, when submitting valid Action Taken data, then the record is created with the authenticated staff member as `performedBy` and associated with the ticket.
* **AC-02:** Given an authenticated Requester viewing their own ticket, when viewing the Actions Taken area, then all recorded actions are visible, but create and edit action controls are hidden and rejected if invoked directly via API.
* **AC-03:** Given an authenticated Requester, when accessing an Action Taken endpoint for a ticket owned by another user, then the request returns `403 Forbidden` with no metadata leaked.
* **AC-04:** Given an Action Taken creation request with `followUpRequired = true` but an empty `followUpNote`, when submitted, then the backend rejects the request with `400 Bad Request` and a clear validation error.
* **AC-05:** Given a Ticket with zero Action Taken records, when an IT Staff member attempts to update status to `RESOLVED`, then the backend rejects the update with `400 Bad Request` citing the Resolution Gate rule.
* **AC-06:** Given a Ticket with at least one Action Taken record and valid status transition prerequisites, when an IT Staff member updates status to `RESOLVED`, then the status transition succeeds and is reflected in the queue and detail views.
* **AC-07:** Given an authenticated Requester, when viewing their ticket, they can toggle the advisory indicator "Problem Appears Resolved", and the backend records the flag without altering the ticket's formal status.
* **AC-08:** Given an authenticated Requester requesting `GET /api/dashboard/requester`, then the metrics returned accurately reflect only tickets owned by that authenticated Requester.
* **AC-09:** Given an authenticated IT Staff member requesting `GET /api/dashboard/staff`, then the metrics return accurate aggregate counts for unassigned tickets, tickets assigned to the user, and breakdowns by status and priority.
* **AC-10:** Given a concurrent workflow scenario where a ticket was modified after a user loaded it, when the user attempts a status change with an outdated timestamp, then the backend rejects the update with `409 Conflict`.
* **AC-11:** Given mobile viewports (< 768px), the Dashboards and Actions Taken views render responsive stacked cards without clipping, horizontal scrolling, or broken layouts.
* **AC-12:** Given all regression flows from Labs 1, 2, and 3, all authentication, ticket creation, attachment upload/download, public comments, internal notes, and user administration continue to pass with 100% green test suites.

## 10. Definition of Done (DoD)
- [ ] Database migration created and verified with Prisma.
- [ ] Idempotent seed data includes realistic actions and dashboard states.
- [ ] Backend routes and authorization middlewares implemented for Actions Taken and Dashboards.
- [ ] Frontend React components built matching Zen Green UI specifications across Desktop, Tablet, and Mobile.
- [ ] Unit, Integration, and E2E automated test suites pass with 100% success on the feature branches and staging.
- [ ] Zero horizontal overflow across all screens on mobile devices.
- [ ] Bidirectional peer reviews documented and approved on GitHub.
- [ ] Feature branches merged into `lab4-staging` and released to `main`.
- [ ] All 7 GitHub Issues moved to `Done` on the Kanban board.
- [ ] Final 9-part PDF submission report compiled and validated.

## 11. Assumptions and Decisions
1. **Action Taken Mutability:** While Action Taken records serve as an operational audit log, IT Staff may edit the `result`, `followUpNote`, or `attachmentNotes` to update findings as investigation proceeds. The original `actionDateTime` and `performedById` remain immutable once created.
2. **Dashboard Query Performance:** Dashboard metrics are computed using efficient Prisma aggregations (`count`, `groupBy`) rather than loading full ticket collections into memory, ensuring responsive page load times even under large datasets.
3. **Drill-down URL Parameters:** Clicking dashboard metric cards routes to `/staff/queue` or `/my-tickets` with standard query parameters (e.g. `?status=WAITING_FOR_REQUESTER` or `?filter=unassigned`), pre-populating filter controls seamlessly.
