# Lab 2 Sprint Engineering Specification

## 1. Sprint Goal
Deliver the MVP for the Requester-facing ticketing application, establishing a reusable UI foundation and core ticket lifecycle workflows using a mocked Development Requester context. The implementation must adhere strictly to the Zen Green Theme (#006B3C) and guarantee absolute data isolation between requesters.

## 2. Stakeholder Request Interpretation
The business requires a professional, responsive portal allowing Requesters to submit support tickets, attach evidence, and track their issues seamlessly. The system must enforce strict data isolation between users to ensure confidentiality. For this iteration, a temporary Development Requester selection mechanism will be utilized for testing and session context instead of a full authentication and authorization system. 

## 3. Scope

### Included
- **Development Requester Selection:** Interface to mock an authenticated session by selecting an active Requester profile.
- **Create Ticket Workflow:** Form with comprehensive client and server-side validation for submitting new support tickets.
- **My Tickets List:** A Requester dashboard featuring search by text, filtering by category/status, sorting by date, and server-side pagination.
- **Requester Ticket Detail:** A read-only comprehensive view of a specific ticket, displaying all submitted fields, current status, and attached files.
- **Attachment Lifecycle:** 
  - Maximum 5 files per ticket.
  - Maximum 5MB file size limit per file.
  - Allowed file types strictly limited to: JPG, PNG, WEBP, and PDF.
  - Soft removal functionality for attachments.

### Excluded
- Real authentication, login/logout flows, and session tokens (e.g., JWT).
- IT Staff workflows, including claiming tickets, reassigning, or changing IT priority.
- Collaboration features such as Public Comments, Internal Notes, or Actions Taken.
- State transitions beyond the initial 'New' state upon ticket creation.

## 4. Functional Requirements
- **FR-01:** The system must provide a simulated Requester selector on initial load or unauthorized access to establish the current user context.
- **FR-02:** Requesters must be able to submit a ticket requiring a summary, detailed description, category, and related system.
- **FR-03:** Requesters must be able to upload up to 5 permitted attachments simultaneously or sequentially and have the ability to soft-remove them before or after submission.
- **FR-04:** Requesters must be able to view a paginated list of their own tickets, with capabilities to search by summary, filter by status or category, and sort by creation date.
- **FR-05:** Requesters must be able to click on any ticket in their list to view its full details and associated attachments.

## 5. Business Rules
- **BR-01 (Unique Ticket ID):** The backend system MUST generate an official, strictly unique Ticket Number (e.g., INC-10001) for every successfully created ticket.
- **BR-02 (Initial State):** Every newly created ticket MUST default to the Current Status 'New'.
- **BR-03 (Mock Auth):** Lab 2 relies on a "Development Requester" selector. The selected identity simulates the user context for testing only and is strictly not an authentication system.
- **BR-04 (Attachment Limits):** Attachments are strictly limited to a maximum of 5 active files per ticket, with a maximum size of 5MB per individual file. Allowed MIME types are restricted to JPG/JPEG, PNG, WEBP, and PDF.
- **BR-05 (Soft Removal):** Removed attachments undergo soft removal. The database record is marked as deleted (e.g., `deletedAt` populated). Removed files must not be downloadable or previewable, but the historical metadata remains in the database.
- **BR-06 (Ticket Ownership Protection):** A Requester MUST ONLY be able to view, access, and manage tickets and attachments that they explicitly own. All backend endpoints must rigorously validate ownership before returning or modifying data.

## 6. UI Specification Summary
- **Theming:** The application must strictly adhere to the Zen Green Theme. Primary brand color: `#006B3C`. Secondary/Accent color: `#0B7A46`.
- **Responsive Layout:** The grid and layout must adapt gracefully from large desktop viewports down to mobile screens (320px minimum width) without horizontal scrolling. Use CSS Grid or Flexbox.
- **State Feedback:** 
  - **Empty States:** Provide visually distinct and friendly empty state illustrations or messages when no tickets exist.
  - **Error States:** Display clear, non-technical error banners or toasts for API failures (e.g., "Failed to load tickets. Please try again.").
- **Form Validation:** Input fields must provide immediate visual cues (red borders, helper text) for validation errors (e.g., missing mandatory fields, exceeding character limits).
- **Status Badges:** Ticket statuses must be visually distinguishable using color-coded badges (e.g., a green badge for 'New').

## 7. Data Changes
The following comprehensive Prisma schema structure is proposed to support the MVP:

- **`RequesterUser` Model:** Represents the user submitting the ticket.
  - Fields: `id` (UUID), `name`, `email`, `department`, `createdAt`.
- **`Category` Model:** Lookup table for ticket categories (e.g., Hardware, Software).
  - Fields: `id`, `name`, `isActive`.
- **`RelatedSystem` Model:** Lookup table for impacted systems (e.g., ERP, Email).
  - Fields: `id`, `name`, `isActive`.
- **`Ticket` Model:** The core entity.
  - Fields: `id` (UUID), `ticketNumber` (String, Unique), `summary` (String), `description` (Text), `status` (String, default 'New'), `requesterId` (Relation to `RequesterUser`), `categoryId` (Relation to `Category`), `systemId` (Relation to `RelatedSystem`), `createdAt`, `updatedAt`.
- **`Attachment` Model:** Manages uploaded files.
  - Fields: `id` (UUID), `ticketId` (Relation to `Ticket`), `fileName`, `fileSize`, `mimeType`, `storageUrl`, `uploadedAt`, `deletedAt` (DateTime?, for soft removal).

## 8. API Contract

**Global Rule:** All secured endpoints expect a custom header (e.g., `X-Requester-Id`) indicating the active mock user.

- **`GET /api/requesters`**
  - Use: Fetch all active requesters for the mock selection screen.
  - Returns: `200 OK` with a list of users.
- **`POST /api/tickets`**
  - Use: Create a new ticket.
  - Payload: `{ summary, description, categoryId, systemId, attachments[] }`
  - Returns: `201 Created` on success, `400 Bad Request` on validation failure.
- **`GET /api/tickets`**
  - Use: Fetch a paginated, filtered, and sorted list of tickets for the active requester.
  - Query Params: `page`, `limit`, `search`, `status`, `sortBy`, `sortOrder`.
  - Returns: `200 OK` (with total count and data), `403 Forbidden` if missing requester context.
- **`GET /api/tickets/:id`**
  - Use: Fetch full details for a specific ticket.
  - Returns: `200 OK`, `404 Not Found`, or `403 Forbidden` (if the requester does not own the ticket).
- **`POST /api/attachments`**
  - Use: Upload a new file.
  - Payload: `multipart/form-data` with the file.
  - Returns: `201 Created` with metadata, `400 Bad Request` if size/type limits are exceeded.
- **`DELETE /api/attachments/:id`**
  - Use: Soft-remove an attachment.
  - Returns: `200 OK` on success, `403 Forbidden` if ownership fails, `404 Not Found` if missing.

## 9. Acceptance Criteria

- **AC-01 (Successful Ticket Creation):** Given a selected Requester has filled out the Create Ticket form with valid data, When they submit, Then a new Ticket is saved with status 'New', a unique Ticket Number is generated, and the user is redirected to the ticket detail page.
- **AC-02 (Requester Context Required):** Given no Development Requester is selected in the local storage/session, When the user attempts to load the My Tickets dashboard or Create Ticket form, Then the system automatically redirects them to the Development Requester Selection screen.
- **AC-03 (Cross-Requester Data Isolation):** Given Requester B is the active session, When an API request is made to `GET /api/tickets/:id` for a ticket explicitly owned by Requester A, Then the backend strictly denies access and returns a `403 Forbidden` or `404 Not Found` error.
- **AC-04 (Empty State Rendering):** Given a newly selected Requester has exactly zero tickets in the database, When they view the My Tickets dashboard, Then a friendly empty state illustration and message is displayed urging them to create their first ticket.
- **AC-05 (Attachment Size Limit Rejection):** Given a Requester is attaching files, When they select a valid PDF file that is 6MB in size, Then the UI immediately rejects the file and displays an error stating the 5MB limit was exceeded.
- **AC-06 (Attachment Type Limit Rejection):** Given a Requester is attaching files, When they select an executable `.exe` file, Then the UI immediately rejects the file and displays an error listing the allowed MIME types (JPG, PNG, WEBP, PDF).
- **AC-07 (Attachment Count Limit Rejection):** Given a Requester has already attached 5 files to a draft ticket, When they attempt to attach a 6th file, Then the action is blocked, and an error message regarding the 5-file maximum limit is displayed.
- **AC-08 (Attachment Soft Removal):** Given an uploaded attachment exists on a ticket, When the Requester clicks the remove button, Then the attachment disappears from the active UI, the `deletedAt` field is populated in the database, but the physical file is not destroyed.
- **AC-09 (Soft Removed Files Excluded):** Given an attachment was previously soft-removed, When the Requester views the Ticket Detail page, Then the removed attachment is strictly not listed in the UI and its direct download URL returns an error.
- **AC-10 (Pagination Navigation):** Given a Requester has 25 tickets and the limit is 10 per page, When they click on 'Page 2', Then the table updates to display tickets 11 through 20 without refreshing the entire browser window.

## 10. Definition of Done
- **Product Completion:** All functional scope, UI requirements, and acceptance criteria are implemented and verifiable.
- **Traceable Tests:** Automated tests including Unit (logic validation), API (endpoint security and payloads), and UI/E2E components are written, map directly to the Acceptance Criteria, and pass consistently on the main branch.
- **Visual & UI Compliance:** Visual inspection confirms strict adherence to the Zen Green UI specification (#006B3C), typography, padding, and correct responsive behavior across mobile, tablet, and desktop devices.
- **Workflow:** Code is completed via isolated feature branches, strictly peer-reviewed in Pull Requests (PRs), and properly merged without conflicts.

## 11. Assumptions and Decisions
- **Session Simulation:** The Development Requester context will be maintained on the frontend (e.g., React Context or Local Storage) and passed to the backend via a custom HTTP header (e.g., `X-Requester-Id`) on every secured API call. 
- **Soft Deletion Mechanism:** The soft removal logic relies entirely on filtering out records where the `deletedAt` column is not null. Prisma queries for active attachments will always append a `where: { deletedAt: null }` clause.
- **File Storage:** For Lab 2 MVP purposes, attachments will be stored locally on the backend server's file system rather than an external object store like AWS S3.