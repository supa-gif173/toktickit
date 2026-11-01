# Sprint 4 Engineering Specification

## 1. Sprint Goal
The goal of Sprint 4 is to complete the core TokTickIT service-desk workflow by introducing a parent-child Actions Taken tracking structure under Tickets, enforcing the complete Ticket lifecycle and Resolution Gate, delivering role-appropriate Dashboards for Requesters, IT Staff, and Administrators, and hardening the entire application across all layers to ensure seamless regression behavior and full compliance with the Zen Green design system.

## 2. Stakeholder Request
The stakeholders require a reliable way to plan, log, and track the actual hands-on work performed on tickets. Each action must record the Action Date/Time, Action Description, Result, Performed by (auto-populated with authenticated user), Follow-Up Required flag, Follow-Up Note, and Attachment Notes. While a primary Ticket Owner coordinates the ticket, any IT Staff member can perform and record actions. Requesters may indicate that a problem appears resolved, but formal resolution requires IT Staff verification (Resolution Gate). Furthermore, concise role-appropriate dashboards must provide operational metrics and direct drill-down navigation for Requesters, IT Staff, and Administrators without duplicating detailed list views.

## 3. Scope
**Included:**
- Parent-child `ActionTaken` data model linked to Tickets, performedBy Users, and assigned IT Staff (`assigneeId`).
- Comprehensive Actions Taken operational lifecycle: `PENDING`, `IN_PROGRESS`, `COMPLETED`, and `CANCELLED`.
- Action Taken validation: optional initial `result`, strictly mandatory `result` on `COMPLETED`, rejection of inactive assignees (`400 INACTIVE_ASSIGNEE`), and terminal lock on completed/cancelled actions.
- Read-only Actions Taken visibility for Requesters on their own tickets.
- Complete Ticket status lifecycle: `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, and `CANCELLED`.
- Strict Resolution Gate enforcement: formal transition to `RESOLVED` requires IT Staff review and satisfies 3 prerequisites: (1) Ticket owner is assigned, (2) At least one completed Action Taken with non-empty `result`, and (3) All required follow-up notes are completed.
- Append-only `TicketStatusHistory` audit log atomically recorded inside the same database transaction as ticket status changes.
- Requester "Problem Appears Resolved" toggle treated as advisory feedback.
- Role-appropriate Dashboard interfaces for Requesters, IT Staff, and Administrators with authoritative backend metrics calculation.
- Drill-down navigation from dashboard metric cards to filtered ticket lists and ticket details.
- Optimistic concurrency control using an integer `version` field on both `Ticket` and `ActionTaken` with atomic database write predicates (`updateMany({ where: { id, version } })`) inside transactions returning HTTP 409 Conflict.
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
* **FR-01 (Actions Taken Data Capture & Lifecycle):** The system shall allow authorized IT Staff and Administrators to record Actions Taken under a Ticket, capturing Action Date/Time, Assignee (`assigneeId`), Status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), Description, Result (optional initially, mandatory upon completion), Performed by (auto-populated with authenticated user), Follow-Up Required flag, Follow-Up Note (when required), and Attachment Notes.
* **FR-02 (Actions Taken Visibility):** The system shall allow Requesters to view all Actions Taken entries recorded on tickets they own, while strictly prohibiting Requesters from creating, modifying, or deleting actions.
* **FR-03 (Actions Taken Lifecycle Transitions & Updates):** The system shall allow IT Staff and Administrators to update and transition Action Taken records through their operational lifecycle (`PENDING` &rarr; `IN_PROGRESS` &rarr; `COMPLETED` / `CANCELLED`), reassign tasks to active IT Staff, and enforce terminal locks once completed or cancelled.
* **FR-04 (Complete Ticket Lifecycle):** The system shall support and enforce the complete Ticket status lifecycle consisting of `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, and `CANCELLED`.
* **FR-05 (Resolution Gate):** The system shall enforce that transitioning a Ticket to `RESOLVED` or `CLOSED` requires explicit IT Staff/Admin action and satisfies all three Resolution Gate conditions: (1) Ticket owner is assigned, (2) At least one Action Taken has reached `COMPLETED` with a non-empty `result`, and (3) All required follow-up notes are documented.
* **FR-06 (Requester Resolution Indication):** The system shall allow Requesters to toggle an advisory indicator ("Problem Appears Resolved") on their own tickets without directly mutating the authoritative Ticket status.
* **FR-07 (Requester Dashboard):** The system shall provide Requesters with a concise dashboard displaying key personal metrics (My Open Tickets, Waiting on Me, Recently Updated, Recently Resolved) and quick-action navigation.
* **FR-08 (IT Staff & Admin Dashboard):** The system shall provide IT Staff and Administrators with an operational dashboard displaying triage metrics (Unassigned Tickets, Assigned to Me, Breakdown by Status, Breakdown by IT Priority, Recently Updated Tickets) with interactive drill-down links to filtered queue views.
* **FR-09 (Optimistic Concurrency Protection):** The system shall detect concurrent updates to tickets or actions using an integer `version` field and atomic database write predicates (`updateMany({ where: { id, version } })`) inside database transactions, returning HTTP `409 Conflict` on version collision.
* **FR-10 (Full System Regression & Hardening):** The system shall preserve all previously approved functionalities from Labs 1, 2, and 3, maintaining consistent error handling, busy states, accessible keyboard focus, and responsive Zen Green design.
* **FR-11 (Append-Only Ticket Status History):** The system shall atomically record an immutable status history audit log (`TicketStatusHistory`) whenever a Ticket's status changes.

## 5. Business Rules
* **BR-01 (Action Taken Parent-Child Integrity):** Each Action Taken belongs to exactly one Ticket. If a Ticket is deleted, all associated Action Taken records cascade delete.
* **BR-02 (Ownership vs. Action Responsibility & Assignee Validation):** The primary Ticket Owner coordinates the Ticket, but any active IT Staff member or Administrator may take action and log an Action Taken entry. Furthermore, Actions Taken can be assigned to an active IT Staff member (`assigneeId`). Any attempt to assign an action to an inactive user or non-staff user is rejected with HTTP `400 Bad Request` and error code `INACTIVE_ASSIGNEE`.
* **BR-03 (Action Taken Field Validation & Lifecycle Rules):**
  - `actionDateTime`: ISO date-time, defaults to the current timestamp. Cannot be in the future.
  - `status`: Enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`). Defaults to `PENDING` upon creation.
  - `description`: Plain text, mandatory, 1 to 2,000 characters. Whitespace-only content is rejected.
  - `result`: Plain text, 1 to 2,000 characters. Optional during `PENDING` or `IN_PROGRESS`, but strictly mandatory when transitioning to `COMPLETED`. Whitespace-only content is rejected upon completion.
  - `performedById`: Populated automatically from the authenticated JWT session. Cannot be spoofed by client request payloads.
  - `assigneeId`: Optional relation to an active IT Staff member (`User.isActive = true` and `role IN ('STAFF', 'ADMIN')`).
  - `followUpRequired`: Boolean flag, defaults to `false`.
  - `followUpNote`: Required when `followUpRequired` is `true` (1 to 1,000 characters). Must be null or empty when `followUpRequired` is `false`.
  - `attachmentNotes`: Optional plain text reference, up to 500 characters.
  - `terminalLock`: Once an Action Taken reaches `COMPLETED` or `CANCELLED`, it is permanently locked. Any subsequent update or status transition attempt is rejected with HTTP `400 Bad Request`.
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
* **BR-06 (Comprehensive Resolution Gate):** A ticket cannot be transitioned to `RESOLVED` unless all three criteria are satisfied:
  1. **Owner Assigned:** `ticket.ownerId IS NOT NULL`.
  2. **At Least One Completed Action:** There exists at least one `ActionTaken` with `status = 'COMPLETED'` and a non-empty `result`.
  3. **Follow-Up Notes Satisfied:** All `ActionTaken` records with `followUpRequired = true` have a non-empty `followUpNote`.
  Any status transition to `RESOLVED` failing any of these conditions is rejected with HTTP `400 Bad Request` and a descriptive resolution error.
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
* **BR-11 (Optimistic Concurrency via Atomic Integer Versioning):**
  - Both `Ticket` and `ActionTaken` models maintain an integer `version` field (defaults to 1).
  - Status and action update mutations must supply an `expectedVersion` integer.
  - Mutations execute using atomic database write predicates within a Prisma transaction: `updateMany({ where: { id, version: expectedVersion }, data: { ..., version: expectedVersion + 1 } })`.
  - If the query updates 0 rows, the transaction rolls back and returns HTTP `409 Conflict`.
* **BR-12 (Data Backfill & Legacy Continuity):** Legacy tickets created in Labs 1-3 without Action Taken records remain valid. Dashboard calculations treat existing records accurately without errors.
* **BR-13 (Append-Only Ticket Status History):** Whenever a ticket status changes, an audit record must be atomically appended to `TicketStatusHistory` (`ticketId`, `fromStatus`, `toStatus`, `changedById`, `changedAt`) within the same database transaction. The history table is strictly append-only; updates and deletions are prohibited.

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
Introduce `ActionStatus` enum, `ActionTaken` model, and `TicketStatusHistory` model in Prisma, linking them to `Ticket` and `User`:
```prisma
enum ActionStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model ActionTaken {
  id                String       @id @default(uuid())
  ticketId          String
  ticket            Ticket       @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  performedById     String
  performedBy       User         @relation("ActionsPerformed", fields: [performedById], references: [id])
  assigneeId        String?
  assignee          User?        @relation("ActionsAssigned", fields: [assigneeId], references: [id])
  actionDateTime    DateTime     @default(now())
  description       String
  result            String?
  status            ActionStatus @default(PENDING)
  followUpRequired  Boolean      @default(false)
  followUpNote      String?
  attachmentNotes   String?
  version           Int          @default(1)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([ticketId])
  @@index([performedById])
  @@index([assigneeId])
}

model TicketStatusHistory {
  id          String   @id @default(uuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  fromStatus  String
  toStatus    String
  changedById String
  changedBy   User     @relation("StatusChanges", fields: [changedById], references: [id])
  changedAt   DateTime @default(now())

  @@index([ticketId])
  @@index([changedById])
}
```

Additions to `Ticket`:
- `actionsTaken ActionTaken[]`
- `statusHistory TicketStatusHistory[]`
- `problemAppearsResolved Boolean @default(false)`
- `version Int @default(1)`

Additions to `User`:
- `actionsPerformed ActionTaken[] @relation("ActionsPerformed")`
- `actionsAssigned ActionTaken[] @relation("ActionsAssigned")`
- `statusChanges TicketStatusHistory[] @relation("StatusChanges")`

### 7.2 Database Decisions & Justifications
1. **Cascade Deletion on Ticket Relation (`onDelete: Cascade`):** Actions Taken and Status History are subordinate child records of a Ticket. Deleting a ticket in a testing or maintenance workflow cleanly removes its associated action history to prevent orphaned records and foreign key constraint violations.
2. **Explicit Integer Versioning for Concurrency:** To eliminate subtle clock-drift race conditions inherent in timestamp comparisons, both `Ticket` and `ActionTaken` maintain an integer `version` incremented atomically (`updateMany({ where: { id, version } })`) inside database transactions.
3. **Append-Only History Preservation:** `TicketStatusHistory` records are immutable and appended in the exact same transaction that mutates `Ticket.status`.
4. **Conditional Validation via Application Layer instead of Database Constraints:** While `result` is optional during `PENDING` and `IN_PROGRESS`, it becomes strictly required on transition to `COMPLETED`. Similarly, `followUpNote` is required if and only if `followUpRequired` is true. Managing these in the Express route validation layer ensures rich, actionable HTTP 400 error codes.
5. **Dedicated Performance Indexes on Foreign Keys:** Foreign key indexes on `ticketId`, `performedById`, and `assigneeId` ensure fast retrieval for ticket timelines and dashboard calculations.

### 7.3 Seed Data Strategy
The seed script will be extended to:
- Be strictly idempotent (safe to run repeatedly using `upsert`).
- Create realistic Actions Taken across seeded tickets: tickets with zero actions (to test the resolution gate), tickets with pending actions, tickets with completed actions, and tickets with actions assigned to different staff members.
- Ensure non-zero and zero counts for dashboard metrics across Requesters and IT Staff.
- Seed initial status history records for all seeded tickets.

## 8. API Contract Summary
The REST API expands with new endpoints for Actions Taken, Ticket Status History, and Dashboards, strictly secured by session cookies and role authorization:
- `GET /api/tickets/:id/actions`: Retrieve all Actions Taken for a ticket (Requester owner, Staff, Admin).
- `POST /api/tickets/:id/actions`: Create a new Action Taken record with assignee, description, and status (Staff, Admin only).
- `PATCH /api/tickets/:ticketId/actions/:actionId`: Update an existing Action Taken, advance lifecycle, or complete/cancel with terminal locking and atomic concurrency version check (Staff, Admin only).
- `GET /api/tickets/:id/history`: Retrieve append-only status transition audit history (Requester owner, Staff, Admin).
- `PATCH /api/tickets/:id/resolve-indicator`: Requester toggles problemAppearsResolved advisory flag (Requester owner only).
- `PATCH /api/staff/tickets/:id/status`: Update ticket status enforcing Status Transition Matrix, Resolution Gate (owner assigned + completed action with result + follow-up notes satisfied), atomic concurrency version check, and status history logging in one transaction (Staff, Admin only).
- `GET /api/dashboard/requester`: Retrieve authoritative Requester dashboard metrics (Requester only).
- `GET /api/dashboard/staff`: Retrieve authoritative IT Staff dashboard metrics (Staff, Admin only).

For exact schemas, request/response bodies, and HTTP status codes, see [api-spec.md](api-spec.md).

## 9. Acceptance Criteria
* **AC-01:** Given an authenticated IT Staff member and a valid accessible ticket, when submitting valid Action Taken data, then the record is created with the authenticated staff member as `performedBy`, the selected active assignee, status `PENDING`, and associated with the ticket.
* **AC-02:** Given an authenticated Requester viewing their own ticket, when viewing the Actions Taken area, then all recorded actions are visible, but create and edit action controls are hidden and rejected if invoked directly via API.
* **AC-03:** Given an authenticated Requester, when accessing an Action Taken endpoint for a ticket owned by another user, then the request returns `403 Forbidden` with no metadata leaked.
* **AC-04:** Given an Action Taken creation request with `followUpRequired = true` but an empty `followUpNote`, when submitted, then the backend rejects the request with `400 Bad Request` and a clear validation error.
* **AC-05:** Given an attempt to assign an Action Taken to an inactive user or non-staff user, when submitted, then the backend rejects the request with HTTP `400 Bad Request` and error code `INACTIVE_ASSIGNEE`.
* **AC-06:** Given an Action Taken in `COMPLETED` or `CANCELLED` state, when an IT Staff member attempts to modify or transition it, then the backend rejects the request with `400 Bad Request` citing terminal lock.
* **AC-07:** Given a Ticket missing any of the Resolution Gate prerequisites (unassigned owner, 0 completed actions, empty action result on completed action, or missing required follow-up note), when an IT Staff member attempts to update status to `RESOLVED`, then the backend rejects the update with `400 Bad Request`.
* **AC-08:** Given a Ticket satisfying all Resolution Gate prerequisites, when an IT Staff member updates status to `RESOLVED`, then the status transition succeeds, the version increments atomically, and a new audit row is appended to `TicketStatusHistory` in the same transaction.
* **AC-09:** Given an authenticated Requester, when viewing their ticket, they can toggle the advisory indicator "Problem Appears Resolved", and the backend records the flag without altering the ticket's formal status.
* **AC-10:** Given an authenticated Requester requesting `GET /api/dashboard/requester`, then the metrics returned accurately reflect only tickets owned by that authenticated Requester.
* **AC-11:** Given an authenticated IT Staff member requesting `GET /api/dashboard/staff`, then the metrics return accurate aggregate counts for unassigned tickets, tickets assigned to the user, and breakdowns by status and priority.
* **AC-12:** Given a concurrent workflow scenario where a ticket or action was modified after a user loaded it, when the user attempts a mutation with an outdated `expectedVersion`, then the atomic predicate rejects the update with `409 Conflict`.
* **AC-13:** Given mobile viewports (< 768px), the Dashboards, Actions Taken views, and Status History render responsive stacked cards without clipping, horizontal scrolling, or broken layouts.
* **AC-14:** Given automated accessibility scanning via Axe-core, all Sprint 4 pages and modal dialogs pass with zero WCAG 2.1 AA violations.
* **AC-15:** Given all regression flows from Labs 1, 2, and 3, all authentication, ticket creation, attachment upload/download, public comments, internal notes, and user administration continue to pass with 100% green test suites.

## 10. Definition of Done (DoD)
- [ ] Database migration created and verified with Prisma (`ActionTaken`, `TicketStatusHistory`, `version` fields).
- [ ] Idempotent seed data includes realistic actions, status history, and dashboard states.
- [ ] Backend routes and authorization middlewares implemented for Actions Taken lifecycle, Status History, and Dashboards.
- [ ] Atomic transactions and version predicates implemented for concurrency conflict prevention (HTTP 409).
- [ ] Frontend React components built matching Zen Green UI specifications across Desktop, Tablet, and Mobile.
- [ ] Zero WCAG 2.1 AA accessibility violations verified with Axe-core.
- [ ] Unit, Integration, and E2E automated test suites pass with 100% success on the feature branches and staging.
- [ ] Zero horizontal overflow across all screens on mobile devices.
- [ ] Bidirectional peer reviews documented and approved on GitHub.
- [ ] Feature branches merged into `lab4-staging` and released to `main`.
- [ ] All 7 GitHub Issues moved to `Done` on the Kanban board.
- [ ] Final 9-part PDF submission report compiled and validated.
- [ ] Final 9-part PDF submission report compiled and validated.

## 11. Assumptions and Decisions
1. **Action Taken Mutability:** While Action Taken records serve as an operational audit log, IT Staff may edit the `result`, `followUpNote`, or `attachmentNotes` to update findings as investigation proceeds. The original `actionDateTime` and `performedById` remain immutable once created.
2. **Dashboard Query Performance:** Dashboard metrics are computed using efficient Prisma aggregations (`count`, `groupBy`) rather than loading full ticket collections into memory, ensuring responsive page load times even under large datasets.
3. **Drill-down URL Parameters:** Clicking dashboard metric cards routes to `/staff/queue` or `/my-tickets` with standard query parameters (e.g. `?status=WAITING_FOR_REQUESTER` or `?filter=unassigned`), pre-populating filter controls seamlessly.
