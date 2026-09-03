# Lab 2 Sprint: UI/UX Specification

This document serves as the comprehensive visual and structural contract for the frontend implementation of the Ticket Management System (Lab 2), based on the requirements of Appendix C.

## 1. Color Tokens & Theme

The application strictly adheres to the **Zen Green Theme**. All components must use these designated color tokens to ensure consistency and brand alignment.

*   **Primary Brand Color:** `#006B3C` (Used for primary buttons, active navigation items, headers, important highlights).
*   **Secondary/Accent Color:** `#0B7A46` (Used for hover states on primary actions, secondary highlights, subtle gradients).
*   **Pale Green (Surface/Highlight):** `#EAF6EF` (Used for selected rows, active state backgrounds, subtle card backgrounds).
*   **Background Color:** `#F5F7F6` (Used for the main application background).
*   **Surface Color (Cards/Containers):** `#FFFFFF` (Used for main content areas, cards, form containers, dropdown menus).
*   **Text Primary:** `#1A1A1A` (Used for main body text, headings).
*   **Text Secondary:** `#4A4A4A` (Used for labels, supporting text, placeholder text).
*   **Error Color:** Dark Red (e.g., `#B30000` or `#D32F2F`) - Used for destructive actions, validation errors, error banners.
*   **Warning/Notice Color:** Amber (e.g., `#FFC107` or `#F59E0B`) - Used for warnings, pending states.
*   **Success Color:** Green (can share Primary `#006B3C` or a distinct success green like `#2E7D32`) - Used for success toasts, completed states.
*   **Border Color:** `#E0E0E0` or `#D1D5DB` (Used for inputs, dividers, card borders).

## 2. Typography & Component Rules

*   **Font Family:** A professional sans-serif typeface (e.g., Inter, Roboto, or system sans-serif).
*   **Form Labels:** Must be positioned **above** the input controls.
*   **Required Fields:** Must be denoted by a red asterisk (`*`) next to the label. *Note: This is a visual indicator only and does not replace explicit validation error messages.*
*   **Validation Messages:** Must appear immediately **below** the relevant input field in the Error Color (Dark Red). The field border should also turn red.
*   **Button Hierarchy:**
    *   **Primary:** Solid Primary color background with white text (e.g., "Submit Ticket").
    *   **Secondary:** Outline or ghost style using Primary or Neutral colors (e.g., "Cancel", "Filter").
    *   **Destructive:** Solid or outlined Error color (e.g., "Remove Attachment").
    *   **Busy/Loading State:** Must display a spinner or loading indicator within the button, and the button must be disabled to prevent double submission.
*   **Input States:**
    *   **Disabled:** Distinct visual state (e.g., gray background `#F3F4F6`, reduced opacity, `cursor: not-allowed`).
    *   **Read-Only:** Values should be displayed as plain text or in a disabled-looking field without borders, clearly distinguishable from editable fields.

## 3. Layouts & Screen Modes

### 3.1. Development Requester Selection Screen
*   **Purpose:** A testing mechanism to mock an authenticated session.
*   **Layout:** Centered modal or distinct landing page.
*   **Components:** A dropdown or list of active requesters.
*   **Behavior:** Selecting a user sets the active context (e.g., stores `X-Requester-Id`) and redirects to the My Tickets screen.

### 3.2. Create Ticket Screen
*   **Purpose:** Form for submitting a new support request.
*   **Layout:** Single column centered form (desktop) or full width (mobile).
*   **Components:**
    *   **System-Generated Fields:** Clearly indicate fields that are handled by the system (e.g., "Ticket Number: [Generated on Submit]", "Status: New"). These must not look like editable inputs.
    *   **Summary Field:** Single-line text input (`<input type="text">`).
    *   **Description Field:** Multi-line text area (`<textarea>`) with adequate default height (e.g., minimum 4 rows).
    *   **Category & System Fields:** Dropdown selects (`<select>`).
    *   **Attachment Dropzone:** A designated area to drag-and-drop or click to browse for files. Must clearly state limits (Max 5 files, 5MB each, JPG/PNG/WEBP/PDF).

### 3.3. My Tickets Screen
*   **Purpose:** Dashboard for the active requester to view their tickets.
*   **Layout:** Full-width container with a top control bar (search, filters) and a data table/list below.
*   **Components:**
    *   **Search Bar:** Text input to filter tickets by summary.
    *   **Filters:** Dropdowns for Category and Status.
    *   **Status Badges:** Visual color-coded pill/badge for ticket status (e.g., Green for 'New', Amber for 'In Progress').
    *   **Empty States:**
        *   **No Tickets Created:** A friendly illustration and a clear message ("You haven't created any tickets yet.") with a CTA to create one.
        *   **No Results (Search/Filter):** A distinct message ("No tickets match your current filters.") with a CTA to clear filters.
    *   **Pagination:** Controls at the bottom (Previous, Next, Page Numbers) indicating total records and current view.

### 3.4. Ticket Detail Screen
*   **Purpose:** Read-only comprehensive view of a specific ticket.
*   **Layout:** Two-column (desktop) showing main details on the left and metadata/attachments on the right, or single-column (mobile).
*   **Components:**
    *   **Read-Only Data:** All submitted fields (Summary, Description, Category, System, Status) displayed clearly as text, not form inputs.
    *   **Distinct Attachment Actions:** Clear buttons or icons to download active attachments. Soft-removed attachments should not be visible or downloadable.

## 4. Attachment States

The UI must handle and visually represent the following states for file attachments:
*   **Active:** File successfully uploaded and attached. Shows filename, size, icon, and a "Remove" action.
*   **Uploading:** Shows a progress indicator (spinner or bar) while the file is being transferred.
*   **Invalid (Size/Type Limit Rejection):** Immediate visual feedback (toast or inline error message) if a selected file exceeds 5MB or is not a permitted type (JPG, PNG, WEBP, PDF). The file is *not* added to the active list.
*   **Soft-Removed:** If a user removes an active attachment, it immediately disappears from the UI list.
*   **Unavailable:** If a user tries to access a link to a soft-removed or deleted file, display a friendly "File Unavailable" message.

## 5. Responsive Rules

The application must be fully responsive and usable across different viewports.

*   **Desktop (>= 992px):**
    *   Multi-column layouts (e.g., 2 or 3 columns) are permitted and encouraged for complex forms (Create Ticket) or detail views (Ticket Detail).
    *   Data tables for lists (My Tickets) are appropriate.
*   **Tablet (768px - 991px):**
    *   Transition to two-column or wider single-column layouts.
    *   Ensure touch targets are adequately sized.
*   **Mobile (< 768px):**
    *   **Strict Vertical Stacking:** All form fields, layout columns, and controls must stack vertically (100% width).
    *   **Touch-Friendly:** Buttons and interactive elements must have a minimum height/width (e.g., 44px) for easy tapping.
    *   **No Horizontal Scrolling:** The viewport must contain all content without requiring horizontal scrolling.
    *   **Responsive Data Tables:** Standard data tables must convert into responsive card-based lists (each row becomes a vertically stacked card).

## 6. Accessibility (A11y)

*   **Keyboard Focus:** All interactive elements (inputs, buttons, links, dropdowns) must have a clear, visible focus indicator (e.g., a distinct outline) when navigated via the keyboard (Tab key).
*   **Non-Color Reliance:** Information conveyed by color (e.g., red for errors, green for success) must also be conveyed through text, icons, or patterns. Do not rely solely on color.
*   **Accessible Labels:** Icon-only controls (e.g., a trash can icon for "Remove", a magnifying glass for "Search") must have proper accessible labels (e.g., `aria-label`, `<span class="sr-only">`) for screen readers.
*   **Semantic HTML:** Use proper heading hierarchy (`<h1>`, `<h2>`, etc.) and semantic form elements.

## 7. Visual Checklist & Screenshot Paths

Use the following checklist for manual Quality Assurance (QA) verification. Save the corresponding screenshots to the specified directory paths.

### Manual QA Checklist

- [ ] **Theme:** All colors match the Zen Green Theme specification.
- [ ] **Typography:** Form labels are above inputs. Required fields have red asterisks.
- [ ] **Validation:** Error messages appear below fields in red.
- [ ] **Buttons:** Primary, secondary, and destructive buttons follow the hierarchy. Busy states disable the button and show a spinner.
- [ ] **Requester Selection:** The mock login screen successfully sets context and redirects.
- [ ] **Create Ticket:** Form handles vertical stacking on mobile. Dropzone accepts correct files and rejects incorrect ones visually.
- [ ] **My Tickets (List):** Data table converts to cards on mobile. Status badges are distinct.
- [ ] **My Tickets (Empty State):** "No tickets" and "No search results" states display correctly.
- [ ] **Ticket Detail:** All data is read-only. Attachments can be downloaded but not edited. Soft-removed attachments do not appear.
- [ ] **A11y:** Tabbing through the application shows visible focus rings on all interactive elements.

### Screenshot Output Directories

Screenshots capturing the verified states above should be saved to the following artifact paths for review:

*   **Create Ticket Screen (Desktop & Mobile, Validation Errors, Dropzone States):**
    `artifacts/lab-02/screenshots/create-ticket/`
*   **My Tickets Screen (Desktop List, Mobile Cards, Filters Active, Empty States):**
    `artifacts/lab-02/screenshots/my-tickets/`
*   **Ticket Detail Screen (Desktop & Mobile, Attachment List):**
    `artifacts/lab-02/screenshots/ticket-detail/`
*   **Requester Selection Modal/Screen:**
    `artifacts/lab-02/screenshots/requester-selection/`
