# Lab 2 Sprint: Comprehensive UI/UX Specification

This document serves as the comprehensive visual and structural contract for the frontend implementation of the Ticket Management System (Lab 2), strictly reflecting our implemented Zen Green theme.

## 1. Color Tokens and Their Intended Use
The application strictly adheres to the Zen Green Theme using predefined CSS variables:
*   **`--primary` (`#006B3C`):** Primary brand color for main buttons, active navigation, and primary highlights.
*   **`--secondary` (`#0B7A46`):** Used for hover states on primary actions and secondary accents.
*   **`--pale-green` (`#EAF6EF`):** Used to distinctively highlight read-only and system-generated fields.
*   **`--background` (`#F5F7F6`):** Main application background color.
*   **`--surface` (`#FFFFFF`):** Background color for cards, panels, and form containers.
*   **`--text-primary` (`#1A1A1A`):** Main body text and headings.
*   **`--text-secondary` (`#4A4A4A`):** Labels, supporting text, and placeholders.
*   **`--error` (`#D32F2F`):** Destructive actions, validation errors, and invalid states.
*   **`--warning` (`#F59E0B`):** Warnings and pending statuses.
*   **`--success` (`#2E7D32`):** Success indicators and resolved statuses.
*   **`--border` (`#D1D5DB`):** Input borders, dividers, and table borders.

## 2. Typography and Spacing
*   **Typography:** Inter, Roboto, or system sans-serif. Standard base size is 16px (1rem).
*   **Spacing:** Margins and padding use a sensible rem-based scale. Form groups have `1.2rem` bottom margin; grids use `1.5rem` to `2rem` gap spacing.

## 3. Editable, Read-Only, Invalid, Disabled, and Focused Controls
*   **Editable:** Standard white background with a `#D1D5DB` border.
*   **Read-Only / System Generated:** Displays with a `var(--pale-green)` background and muted text to visually distinguish from editable fields.
*   **Invalid:** Displays a `var(--error)` dark red border and red drop shadow on focus.
*   **Disabled:** Opacity is reduced, background is muted (or pale green), and `cursor: not-allowed` is applied.
*   **Focused:** `outline: none` with a prominent `var(--primary)` border and a subtle pale-green box shadow ring.

## 4. Required-Field Marker and Validation-Message Placement
*   **Required Marker:** A red asterisk (`*`) placed immediately next to the form label.
*   **Validation Message:** Appears directly **below** the respective input field in the `var(--error)` color (dark red), using a smaller font size (`0.85rem`).

## 5. Button Hierarchy and Busy State
*   **Primary:** Solid `--primary` background with white text.
*   **Secondary:** Transparent background with `--border` outline, transitioning to `--pale-green` on hover.
*   **Destructive:** Solid `--error` background.
*   **Busy State:** Button becomes `disabled`, opacity slightly reduced, and text updates to "Submitting..." or shows a spinner to prevent double submissions.

## 6. Attachment Selection and Error Presentation
*   **Selection:** A designated Dropzone area allowing click or drag-and-drop.
*   **Error Presentation:** Immediate inline error text (in `var(--error)` color) above the form if limits are violated (e.g., file exceeds 5MB or invalid type).

## 7. Initial, Loading, Validation, Submitting, Success, and Failure States
*   **Initial:** Clean empty form or data-fetching state.
*   **Loading:** Prominent "Loading..." text or spinner centrally placed in containers.
*   **Validation:** Real-time or submit-time inline red error messages below offending fields.
*   **Submitting:** Entire form enters a busy state; buttons disable.
*   **Success:** Redirection to the Ticket Detail view with updated read-only data.
*   **Failure:** A prominent top-level alert box displaying the API error message.

## 8. Desktop, Tablet, and Mobile Layout Rules
*   **Desktop (>= 992px):** Enforces a multi-column layout using `.form-grid` and centers content with a sensible maximum width (e.g., `1200px` container).
*   **Tablet (768px - 991px):** Applies a two-column layout (`grid-template-columns: 1fr 1fr`) where practical. Summary and Description fields are constrained to `full-width` to remain readable.
*   **Mobile (< 768px):** Forces all fields to stack vertically (`flex-direction: column`). Buttons utilize large padding (`0.875rem 1.5rem`) to remain touch-friendly. Horizontal scrolling is strictly prevented using `overflow-x: hidden` on the body.

## 9. Accessibility Labels, Keyboard Focus, and Non-Color Indicators
*   **Accessibility Labels:** All icon-only buttons (like the X to remove an attachment) must have `aria-label` tags.
*   **Keyboard Focus:** Tabbing navigates sequentially. Focused elements have distinct visual rings (`box-shadow` or browser native outlines).
*   **Non-Color Indicators:** Errors use descriptive text alongside red borders. Statuses use distinct textual labels in addition to color badges.

## 10. Application Shell and Active Navigation
*   **Application Shell:** A top Navbar containing the brand logo and active user context (`X-Requester-Id`).
*   **Active Navigation:** The "My Tickets" brand acts as the primary home navigation, returning the user to their dashboard.

## 11. Ticket-List Columns and Mobile Representation
*   **Columns:** Ticket # (Link), Summary, Date Created, and Status.
*   **Mobile Representation:** On screens `< 768px`, the standard table is completely hidden and replaced by vertically stacked Card representations to prevent horizontal scrolling.

## 12. Search, Filters, Sort, Clear-Filters, and Pagination Controls
*   **Search & Filters:** A `.form-grid` layout for Summary (text search), Category (dropdown), and Status (dropdown).
*   **Clear-Filters:** Included in empty states to reset the active search criteria.
*   **Pagination Controls:** "Previous" and "Next" buttons displayed at the bottom right, with textual indicators (e.g., "Showing 1 to 10 of 20") on the bottom left.

## 13. Priority and Status Badge Rules
*   **New:** `--pale-green` background with `--primary` text.
*   **In Progress:** Amber/Yellow background with dark amber text.
*   **Resolved:** Light green background with dark green text.

## 14. Empty-List versus No-Results Presentation
*   **Empty-List:** User has 0 tickets total. Displays "You haven't created any tickets yet" and offers a primary CTA button to create one.
*   **No-Results:** User filtered out all tickets. Displays "No tickets match your current filters" and offers a secondary CTA to "Clear Filters".

## 15. Requester Ticket Detail Read-Only Layout
*   **Layout:** Responsive grid layout. Left side displays the Summary and Description (with `word-break: break-word`). Right side displays Ticket Details (ID, Category, System, Status) and the Attachments list.
*   All fields here utilize the `--pale-green` read-only indicator for visual distinction.

## 16. Active, Uploading, Invalid, Removed, and Unavailable Attachment States
*   **Active:** File is visible in a green row with a "Remove" or "Download" button. Names have `word-break: break-all`.
*   **Uploading:** An overlay displays "Uploading..." locking the dropzone.
*   **Invalid:** Discarded immediately with a visible error.
*   **Removed/Unavailable:** Soft-removed files immediately vanish from the UI and are not rendered on the detail page.

## 17. Desktop Table and Mobile Card or Responsive-Table Behavior
*   The `.desktop-table` class relies on standard `<table>` elements and is shown `>= 768px`.
*   The `.mobile-cards` class wraps `<div>` elements styling each row as a block-level card and is shown `< 768px`.

## 18. Visual Inspection Checklist and Screenshot Paths
During manual testing, verify all states and save evidence to the following artifact paths:

- [ ] **Create Ticket:** `artifacts/lab-02/screenshots/create-ticket/`
- [ ] **My Tickets:** `artifacts/lab-02/screenshots/my-tickets/`
- [ ] **Ticket Detail:** `artifacts/lab-02/screenshots/ticket-detail/`
