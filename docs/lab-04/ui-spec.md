# UI Specification (Sprint 4)

## 1. Zen Green UI Extensions & Design System
Lab 4 continues to build upon the Zen Green visual language established in Lab 2 and extended in Lab 3. The interface reinforces simplicity, clear role boundaries, high data density without clutter, and consistent feedback.

### Color Palette & Visual Tokens
* **Primary Forest Green:** `#1B4332` (Headers, branding, primary button states)
* **Accent Medium Green:** `#2D6A4F` (Secondary buttons, active tab underlines, badges)
* **Light Green Tint:** `#D8F3DC` / `#E9F7EF` (Card backgrounds, table header fills, selected rows)
* **Subtle Mint Background:** `#F8FBF9` (Main screen canvas)
* **Neutral Dark:** `#212529` (Primary typography)
* **Neutral Gray / Border:** `#DEE2E6` (Dividers, card outlines)
* **Follow-Up Amber Alert:** `#FFF3CD` / `#856404` (Highlighting actions requiring follow-up)
* **Resolution Gate Alert:** `#D1E7DD` / `#0F5132` (Resolution gate confirmation states)

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
    2. *Performed By:* Name of the staff member who took action (with `[Staff]` or `[Admin]` badge).
    3. *Description:* Summary of work performed.
    4. *Result:* Outcome of the action taken.
    5. *Follow-Up:* Badge indicating `None` (gray) or `Required` (amber alert badge). Clicking or hovering reveals the Follow-Up Note.
    6. *Attachments:* Referenced file names (e.g., "router-log.txt").
    7. *Actions:* `Edit` button (for Staff/Admin).
  - **Mobile View (< 768px):** Stacked cards with clear labels, prominent Result text, and indented Follow-Up callout box.
* **Create Action Modal / Drawer:**
  - Form fields:
    - *Action Date/Time:* Pre-filled with current date/time.
    - *Performed By:* Displayed as read-only text (authenticated user).
    - *Action Description:* Textarea, required, 1-2,000 characters.
    - *Result / Outcome:* Textarea, required, 1-2,000 characters.
    - *Follow-Up Required Checkbox:* Toggle switch or checkbox.
    - *Follow-Up Note:* Conditional textarea; appears and becomes mandatory only when checkbox is checked.
    - *Attachment Notes:* Optional text input (e.g., "See attachment screenshot-1.png").
  - Buttons: `Cancel` and `Save Action Taken` (with busy spinner on save).
* **Edit Action Modal:**
  - Allows editing `Result`, `Follow-Up Required`, `Follow-Up Note`, and `Attachment Notes`.
  - `Action Date/Time` and `Performed By` remain read-only for audit preservation.

### 2.4 Ticket Workflow and Resolution Gate Feedback
* **Status Dropdown / Controls:**
  - Renders only valid transitions matching the Status Transition Matrix.
  - When transitioning to `RESOLVED`:
    - The client checks if at least one Action Taken exists.
    - If no Action Taken exists, the status dropdown displays an inline warning: *"Cannot resolve ticket: At least one Action Taken must be recorded before resolving."*
    - Attempting resolution opens a confirmation dialog highlighting the resolution summary and requiring confirmation.
* **Requester Resolution Toggle:**
  - On Requester Ticket Detail, a dedicated prompt: *"Did this resolve your problem?"* with a checkbox or toggle button `Problem Appears Resolved`.
  - Displays clear subtext: *"Informing IT Staff that your issue is resolved. Staff will verify actions and formally close the ticket."*

---

## 3. Feedback States across All Screens
* **Loading:** Pulsing skeleton placeholders for dashboard metric cards and Actions Taken table rows.
* **Inline Validation:** Red error text below textarea/inputs upon blur or form submit if required constraints fail (e.g. missing follow-up note).
* **Success Toast:** Green Zen notification toast: *"Action Taken recorded successfully"* or *"Ticket status updated to Resolved"*.
* **Empty States:** Clean illustrations with explanatory text (e.g., *"No Actions Taken yet. Log an action to document diagnostic or repair work."*).
* **Safe Error Boundaries:** Non-technical error messages with retry options (e.g., *"Unable to load dashboard data. Please try refreshing."*).

---

## 4. Responsive & Accessibility Rules
* **Breakpoints:**
  - *Desktop (&ge; 1024px):* Multi-column dashboard grid (5 horizontal metric cards, 2-column secondary layout), full Actions Taken data table.
  - *Tablet (768px – 1023px):* 3-column metric cards wrapping naturally; fluid table with horizontal scrolling container if needed.
  - *Mobile (< 768px):* 2-column compact metric cards; Actions Taken converts from table to stacked vertical cards.
* **Zero Horizontal Overflow:** All containers enforce `overflow-x: hidden` or scoped scroll containers to eliminate viewport scrollbars.
* **Accessibility:** Full keyboard navigability (`Tab`, `Enter`, `Escape` for modals), clear `:focus-visible` green outlines, and ARIA labels on icon buttons.
