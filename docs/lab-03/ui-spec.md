# UI Specification (Sprint 3)

## 1. Zen Green UI Extensions
Lab 3 continues to use the Zen Green design language. New interfaces will utilize existing CSS tokens, form conventions, cards, badges, buttons, and layout structures.

### Visual Updates
*   **Authentication State:** Replace the Development Requester display in the navigation bar with the authenticated user's name and role badge (e.g., "John Doe [Requester]").
*   **Profile Menu:** Add a dropdown or dedicated profile area providing "Logout" and "Change Password" actions.
*   **Role-Specific Navigation:** Navigation links will only render destinations permitted for the current user's role. Unauthorized destinations must be completely hidden, not just disabled.
*   **Badges:** Consistent badge styling for:
    *   Ticket Status (e.g., New, Open, In Progress, Resolved)
    *   Requested Priority (Low, Medium, High)
    *   IT Priority (Low, Medium, High)
    *   Roles (Requester, IT Staff, Administrator)
*   **Editable vs. Read-Only:** Preserve clear visual distinction between fields a user can edit versus those they can only view.
*   **Comments & Notes:** Public Comments and Internal Notes must be visually distinct. Internal notes might use a subtle tinted background (e.g., light gray or pale yellow) and a distinct icon to emphasize they are private to staff.

## 2. Screen Specifications

### 2.1 Login and Mandatory Password Change
*   **Modes:** Login View, Password Change View.
*   **Login Structure:** Email input, Password input, "Sign In" button.
*   **Password Change Structure:** Current password, New password, Confirm new password, "Change Password" button.
*   **Feedback:** Inline validation for required fields, busy state (spinner on button) during submission, and safe generic failure messages (e.g., "Invalid email or password").

### 2.2 Requester Regression & Public Comments (Ticket Detail)
*   **Modes:** View Ticket, Edit (Add Comment).
*   **Changes:** Remove the Development Requester selector. Add a "Public Comments" section at the bottom of the ticket detail. Add an action (e.g., button or status dropdown option) for the Requester to indicate "Problem Appears Resolved".
*   **Feedback:** Validation for empty comments. Success toast upon posting a comment.

### 2.3 IT Staff Ticket Queue
*   **Modes:** View (List).
*   **Structure:** A data table (desktop) or stacked cards (mobile). 
*   **Columns/Fields:** Ticket Number, Created Date, Summary, Category, Requested Priority, IT Priority, Status, Ticket Owner.
*   **Controls:** Search bar, Status/Priority filters, Sortable column headers (if supported), Pagination controls (Previous, Page Numbers, Next).
*   **Feedback:** Meaningful empty state ("No tickets found"), loading skeleton or spinner during fetch, safe error boundary if API fails.

### 2.4 IT Staff Ticket Detail
*   **Modes:** View Ticket, Edit (Assign, Change Priority/Status, Add Note/Comment).
*   **Structure:** Extends Requester detail view. Adds "Ticket Owner" selector, "IT Priority" selector, full "Status" dropdown.
*   **Communication:** Tabs or clearly separated sections for "Public Comments" and "Internal Notes".
*   **Feedback:** Immediate success/failure feedback on status or priority changes. Distinct styling for Internal Notes to prevent accidental public disclosure.

### 2.5 Administrator User Management
*   **Modes:** List View, Create User Mode (Modal/Drawer), Edit User Mode (Modal/Drawer).
*   **List Structure:** Table showing Name, Email, Role, Status (Active/Inactive), and an "Edit" action button.
*   **Create/Edit Form:** Name, Email, Role (Dropdown: Requester, IT Staff, Administrator), Activation Toggle, Initial Password input (with rule hint).
*   **Feedback:** Inline validation for email format and duplicate emails. Clear visual distinction for "Inactive" users (e.g., muted row text, red status badge).

## 3. Feedback States (All Screens)
*   **Processing/Loading:** Spinners on buttons for submissions; skeleton loaders or full-area spinners for data fetching.
*   **Validation:** Inline red text below the corresponding input field. Focus should ideally return to the first invalid field upon form submission.
*   **Success:** Temporary toast notifications (green) for actions like saving a user, posting a comment, or updating a ticket.
*   **Empty/No-Results:** Clear illustration or text indicating no data (e.g., "No tickets match your search" or "No users found").
*   **Forbidden/Not-Found:** A dedicated error page or component clearly stating the user does not have permission or the resource doesn't exist, providing a button to return to a safe page (e.g., Home or Queue).
*   **Safe API Failure:** Generic, non-technical error messages (e.g., "An unexpected error occurred. Please try again later.") rather than exposing raw stack traces.

## 4. Responsive and Accessibility Rules
*   **Responsive:** Same as Lab 2. Desktop (multi-column layouts, full tables), Tablet (fluid widths, adjusted padding), Mobile (stacked single-column layouts, card-based lists instead of wide tables). Horizontal overflow is prohibited unless explicitly handled by a scrollable container (e.g., a data table).
*   **Accessibility:** Proper contrast ratios for Zen Green tokens. Semantic HTML elements (`<button>`, `<nav>`, `<ul>`). ARIA labels for icon-only buttons. Ensure focus states are clearly visible for keyboard navigation. No clipping or overlapping of interactive elements.
