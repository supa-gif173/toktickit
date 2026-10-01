# API Specification (Sprint 3)

## 1. Authentication & Session
The application uses HTTP-only cookies to store session tokens (e.g., JWT). 

*   **POST `/api/auth/login`**
    *   **Request:** `{ email, password }`
    *   **Response (200):** `{ user: { id, name, role, requiresPasswordChange } }` (Sets HttpOnly Cookie)
    *   **Response (401):** Invalid credentials.
    *   **Response (403):** Account inactive.
*   **POST `/api/auth/logout`**
    *   **Request:** None
    *   **Response (200):** Clears session cookie.
*   **GET `/api/auth/me`**
    *   **Request:** None (uses session cookie)
    *   **Response (200):** `{ user: { id, name, role, requiresPasswordChange } }`
    *   **Response (401):** Unauthenticated.
*   **POST `/api/auth/change-password`**
    *   **Request:** `{ currentPassword, newPassword }`
    *   **Response (200):** Password changed successfully, `requiresPasswordChange` set to false.

## 2. Requester Tickets (Regression)
Continuation of Lab 2 APIs, now requiring Requester authentication. Ownership is strictly enforced via the session token, not client-provided IDs.

*   **GET `/api/tickets`**
    *   **Authorization:** Requester (Returns only tickets owned by the authenticated Requester).
*   **POST `/api/tickets`**
    *   **Authorization:** Requester (Creates ticket owned by authenticated Requester).
*   **GET `/api/tickets/:id`**
    *   **Authorization:** Requester (Fails with 403 or 404 if not owned by Requester).
*   **POST `/api/tickets/:id/attachments`**
    *   **Authorization:** Requester (Ownership check).

## 3. IT Staff Ticket Operations
*   **GET `/api/staff/tickets`** (Ticket Queue)
    *   **Authorization:** IT Staff, Administrator
    *   **Query Params:** `search` (Ticket Number, Summary), `status`, `priority`, `page`, `limit`, `sortBy`, `sortOrder`.
    *   **Response (200):** `{ data: [...tickets], meta: { total, page, limit } }`
*   **GET `/api/staff/tickets/:id`**
    *   **Authorization:** IT Staff, Administrator
*   **PATCH `/api/staff/tickets/:id/assign`**
    *   **Authorization:** IT Staff, Administrator
    *   **Request:** `{ ownerId: string | null }` (null to unassign)
*   **PATCH `/api/staff/tickets/:id/priority`**
    *   **Authorization:** IT Staff, Administrator
    *   **Request:** `{ itPriority: string }`
*   **PATCH `/api/staff/tickets/:id/status`**
    *   **Authorization:** IT Staff, Administrator
    *   **Request:** `{ status: string }`

## 4. Comments & Notes
*   **GET `/api/tickets/:id/comments`**
    *   **Authorization:** Requester (if owner), IT Staff, Administrator
*   **POST `/api/tickets/:id/comments`**
    *   **Authorization:** Requester (if owner), IT Staff, Administrator
    *   **Request:** `{ content: string }`
*   **GET `/api/tickets/:id/notes`**
    *   **Authorization:** IT Staff, Administrator (403 Forbidden for Requesters)
*   **POST `/api/tickets/:id/notes`**
    *   **Authorization:** IT Staff, Administrator (403 Forbidden for Requesters)
    *   **Request:** `{ content: string }`

## 5. Administrator User Management
*   **GET `/api/admin/users`**
    *   **Authorization:** Administrator
    *   **Query Params:** `search` (name, email), `role`.
    *   **Response (200):** `{ users: [{ id, name, email, role, isActive }] }`
*   **POST `/api/admin/users`**
    *   **Authorization:** Administrator
    *   **Request:** `{ name, email, role, initialPassword }`
    *   **Response (201):** User created.
    *   **Response (409):** Email already exists.
*   **PATCH `/api/admin/users/:id`**
    *   **Authorization:** Administrator
    *   **Request:** `{ name?, email?, role?, isActive? }`
    *   **Validation:** Cannot deactivate self. Cannot remove last active admin.
*   **POST `/api/admin/users/:id/reset-password`**
    *   **Authorization:** Administrator
    *   **Request:** `{ newInitialPassword }`
    *   **Response (200):** Password reset, `requiresPasswordChange` set to true.

## 6. Authorization & Safe Errors
Every protected endpoint must return appropriate HTTP status codes:
*   `401 Unauthorized`: Missing or invalid session token.
*   `403 Forbidden`: Authenticated, but lacks required role or data ownership.
*   `404 Not Found`: Resource does not exist (or is masked for security).
*   `400 Bad Request`: Invalid input (e.g., failed validation).
*   `409 Conflict`: Business rule violation (e.g., duplicate email).
*   `500 Internal Server Error`: Unexpected server failure, returned safely without leaking stack traces.
