# UI Specification (Sprint 4)

## 1. Zen Green UI Extensions & Design System
Lab 4 continues to build upon the Zen Green visual language established in Lab 2 and extended in Lab 3. The interface reinforces simplicity, clear role boundaries, high data density without clutter, and consistent feedback.

### Color Palette & Visual Tokens (Canonical TokTickIT Tokens)
The design tokens align with TokTickIT's core design system defined in `client/src/index.css`:
* **Primary Forest Green (`--primary`):** `#006B3C` (Headers, brand identity, active tabs, primary action buttons)
* **Secondary Accent Green (`--secondary`):** `#0B7A46` (Hover button states, active badges, links)
* **Light Pale Green (`--pale-green`):** `#EAF6EF` (Selected rows, metric card tints, secondary button hover states)
* **App Background (`--background`):** `#F5F7F6` (Main screen canvas, neutral background)
* **Card Surface (`--surface`):** `#FFFFFF` (Card panels, modals, data tables)
* **Text Primary (`--text-primary`):** `#1A1A1A` (Primary typography, headings)
* **Text Secondary (`--text-secondary`):** `#4A4A4A` (Labels, metadata, timestamps)
* **Border Gray (`--border`):** `#D1D5DB` (Dividers, input outlines, table borders)
* **Warning / Follow-Up Amber (`--warning`):** `#F59E0B` (Highlighting actions requiring follow-up, pending tickets)
* **Success Green (`--success`):** `#2E7D32` (Resolved status badges, completed action badges)
* **Error / Destructive Red (`--error`):** `#D32F2F` (Inline errors, destructive buttons)

---

## 2. Screen Specifications

### 2.1 Requester Dashboard
* **Route:** `/requester/dashboard` (Default landing screen for authenticated Requesters)
* **Header:** "Welcome back, {User Name}!" with subtext "Here's what's happening with your requests."
* **Metric Cards Grid (Top Section):**
  - **My Open Tickets:** Total active tickets submitted by the user. Clicking cards navigates to `/my-tickets?status=open`.
  - **Waiting on Me:** Count of tickets in `WAITING_FOR_REQUESTER`. Highlights in amber badge. Clicking navigates to `/my-tickets?status=WAITING_FOR_REQUESTER`.
  - **Recently Resolved:** Count of tickets resolved within 30 days. Clicking navigates to `/my-tickets?status=RESOLVED`.
* **Quick Actions Panel:**
  - `+ Create Ticket`: Direct primary button to open the ticket creation form.
  - `View My Tickets`: Secondary button routing to the full ticket list.
* **My Recent Tickets Table / Cards:**
  - Shows up to 5 recently updated tickets.
  - Columns: Ticket Number, Summary, Status Badge, Last Updated Date.
  - Row click navigates to Ticket Detail.
  - Empty state displays friendly illustration with "No tickets yet. Need help? Create your first ticket."

### 2.2 IT Staff & Administrator Dashboard
* **Route:** `/staff/dashboard` (Default landing screen for authenticated IT Staff and Admins)
* **Header:** "Welcome back, {Staff Name}!" with subtext "Operational overview of the IT Service Desk."
* **Top Metric Cards (Horizontal Ribbon):**
  - **New:** Tickets awaiting first triage (`status = NEW`). Drill-down: `/staff/queue?status=NEW`.
  - **Open:** Tickets accepted into the queue (`status = OPEN`). Drill-down: `/staff/queue?status=OPEN`.
  - **In Progress:** Tickets actively being resolved (`status = IN_PROGRESS`). Drill-down: `/staff/queue?status=IN_PROGRESS`.
  - **Waiting for Requester:** Tickets blocked on client reply (`status = WAITING_FOR_REQUESTER`). Drill-down: `/staff/queue?status=WAITING_FOR_REQUESTER`.
  - **My Assigned:** Active tickets owned by the logged-in staff member. Drill-down: `/staff/queue?owner=me`.
* **Secondary Breakdowns (Two-Column on Desktop):**
  - *Left Column (Queue by Priority):* Cards displaying Urgent, High, Medium, and Low ticket counts.
  - *Right Column (Recent Service Desk Tickets):* The 5 most recently updated tickets across the entire organization, with Ticket Number, Summary, Status badge, Priority badge, and Assigned Owner.
* **Quick Actions:**
  - `Search Queue`: Focuses search bar in the Ticket Queue.
  - `My Queue`: Filters queue to `owner=me`.

### 2.3 Actions Taken on Ticket Detail
The Actions Taken module is placed below the Attachments and Notes sections on the Ticket Detail screen (`/staff/tickets/:id` and `/tickets/:id`).

* **Header & Controls:**
  - Section Title: "Actions Taken" with item counter badge (e.g. `Actions Taken (3)`).
  - Primary Button: `+ Add Action` (Visible only to IT Staff and Admins; completely hidden for Requesters).
* **Actions Taken Data Presentation:**
  - **Desktop/Tablet View:** Data table with columns:
    1. *Action Date/Time:* Formatted localized date & time.
    2. *Status:* Badge with distinct token styles:
       - `PENDING`: Gray/amber badge (`bg-amber-50 text-amber-800 border-amber-300`).
       - `IN_PROGRESS`: Blue badge (`bg-blue-50 text-blue-800 border-blue-300`).
       - `COMPLETED`: Success green badge (`bg-green-50 text-green-800 border-green-300`).
       - `CANCELLED`: Neutral muted badge (`bg-gray-100 text-gray-500 line-through`).
    3. *Assignee:* Name of assigned staff member, or "Unassigned". If an assignee is inactive, displays a red `[Inactive]` pill.
    4. *Performed By:* Name of the staff member who logged the action.
    5. *Description:* Summary of work performed or planned.
    6. *Result:* Outcome of the action taken (or "—" if still pending).
    7. *Follow-Up:* Badge indicating `None` (gray) or `Required` (amber alert badge). Clicking or hovering reveals the Follow-Up Note.
    8. *Attachments:* Referenced file names (e.g., "router-log.txt").
    9. *Actions:*
       - If status is `PENDING` or `IN_PROGRESS`: `Edit` button and `Complete` / `Cancel` action buttons.
       - If status is `COMPLETED` or `CANCELLED`: Displays a gray locked pill `[Locked]` with edit controls disabled.
  - **Mobile View (< 768px):** Stacked cards with status badge in header, clear labels, prominent Result text, and indented Follow-Up callout box.
* **Create Action Modal / Drawer:**
  - Form fields:
    - *Action Date/Time:* Pre-filled with current date/time.
    - *Performed By:* Displayed as read-only text (authenticated user).
    - *Assignee:* Dropdown list of active IT Staff and Admins (`User.isActive: true`). Inactive users are excluded or disabled.
    - *Initial Status:* Defaults to `PENDING` (options: `PENDING`, `IN_PROGRESS`, `COMPLETED`).
    - *Action Description:* Textarea, required, 1-2,000 characters.
    - *Result / Outcome:* Textarea; optional if `PENDING`/`IN_PROGRESS`, required if `COMPLETED`.
    - *Follow-Up Required Checkbox:* Toggle switch or checkbox.
    - *Follow-Up Note:* Conditional textarea; appears and becomes mandatory only when checkbox is checked.
    - *Attachment Notes:* Optional text input (e.g., "See attachment screenshot-1.png").
  - Buttons: `Cancel` and `Save Action Taken` (with busy spinner on save).
* **Edit Action Modal:**
  - Available only for non-terminal actions (`PENDING`, `IN_PROGRESS`).
  - Allows editing `Status`, `Assignee`, `Result`, `Follow-Up Required`, `Follow-Up Note`, and `Attachment Notes`.
  - Reassignment verifies assignee activity.
  - Submitting includes `expectedVersion` for optimistic concurrency.
  - `Action Date/Time` and `Performed By` remain read-only for audit preservation.

### 2.4 Ticket Workflow, Resolution Gate, and Status Audit History
* **Ticket Status Audit History Component:**
  - Rendered as an append-only vertical timeline widget under the Ticket Detail sidebar/main view.
  - Each entry displays:
    - Status transition chip: `[fromStatus] &rarr; [toStatus]`.
    - Changed by: User avatar/name with role badge.
    - Timestamp: Formatted localized date/time and relative time ago.
* **Status Dropdown / Controls:**
  - Renders only valid transitions matching the Status Transition Matrix.
  - **Resolution Gate Checklist & Validation:**
    When transitioning to `RESOLVED`, the system verifies and displays a checklist dialog:
    - [x] Ticket Owner assigned (`ticket.ownerId`).
    - [x] At least one completed Action Taken with documented result.
    - [x] All required follow-up notes documented.
    If any prerequisite is unmet, the `Confirm Resolution` button is disabled, and an inline alert explains exactly what must be completed before resolving.
  - On submit, sends `expectedVersion` to prevent stale updates.
* **Requester Resolution Toggle:**
  - On Requester Ticket Detail, a dedicated prompt: *"Did this resolve your problem?"* with a checkbox or toggle button `Problem Appears Resolved`.
  - Displays clear subtext: *"Informing IT Staff that your issue is resolved. Staff will verify actions and formally close the ticket."*

---

## 3. Feedback States across All Screens
* **Loading:** Pulsing skeleton placeholders for dashboard metric cards and Actions Taken table rows.
* **Inline Validation:** Red error text below textarea/inputs upon blur or form submit if required constraints fail (e.g. missing follow-up note, inactive assignee).
* **Success Toast:** Green Zen notification toast: *"Action Taken recorded successfully"* or *"Ticket status updated to Resolved"*.
* **Concurrency Conflict Modal (HTTP 409):** Informational dialog: *"This record has been updated by another user while you were editing. Please refresh to view the latest changes."* with a direct `Refresh` button.
* **Empty States:** Clean illustrations with explanatory text (e.g., *"No Actions Taken yet. Log an action to document diagnostic or repair work."*).
* **Safe Error Boundaries:** Non-technical error messages with retry options (e.g., *"Unable to load dashboard data. Please try refreshing."*).

---

## 4. Responsive & Accessibility Rules
* **Breakpoints:**
  - *Desktop (&ge; 1024px):* Multi-column dashboard grid (5 horizontal metric cards, 2-column secondary layout), full Actions Taken data table, sidebar history timeline.
  - *Tablet (768px – 1023px):* 3-column metric cards wrapping naturally; fluid table with horizontal scrolling container if needed.
  - *Mobile (< 768px):* 2-column compact metric cards; Actions Taken converts from table to stacked vertical cards; status history stacked vertically.
* **Zero Horizontal Overflow:** All containers enforce `overflow-x: hidden` or scoped scroll containers to eliminate viewport scrollbars across all screen widths down to 320px.
* **Accessibility (WCAG 2.1 AA Compliance):**
  - Full keyboard navigability (`Tab`, `Enter`, `Escape` for modals).
  - Clear `:focus-visible` green outlines (`outline-color: var(--primary)`).
  - Explicit ARIA labels on icon buttons, status badges, and timeline nodes.
  - 100% automated Axe-core scan compliance with zero critical, serious, or moderate accessibility violations.
