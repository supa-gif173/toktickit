# REST API Specification (Sprint 4)

## 1. Authentication & Security Conventions
All Sprint 4 endpoints require a valid authenticated session established via `HttpOnly` JWT cookies (`token`).
* **400 Bad Request:** Returned on missing/invalid input fields, inactive assignee assignment (`INACTIVE_ASSIGNEE`), terminal action modification (`TERMINAL_ACTION_LOCKED`), or Resolution Gate failure (`RESOLUTION_GATE_FAILED`).
* **401 Unauthorized:** Returned if the JWT cookie is missing, expired, or invalid.
* **403 Forbidden:** Returned if an authenticated user lacks the required role (e.g. Requester calling IT Staff endpoints) or attempts to access another user's ticket resources.
* **404 Not Found:** Returned if the requested Ticket or Action Taken ID does not exist in the database.
* **409 Conflict:** Returned during optimistic concurrency checks when the provided `expectedVersion` does not match the database row version (atomic write predicate returned count 0).

---

## 2. Actions Taken Endpoints

### 2.1 Get Actions Taken for a Ticket
* **URL:** `GET /api/tickets/:id/actions`
* **Access:** Requester (owned ticket only), IT Staff, Administrator
* **Success Response (200 OK):**
```json
{
  "actions": [
    {
      "id": "act-uuid-001",
      "ticketId": "tkt-uuid-012",
      "performedById": "usr-uuid-002",
      "performedBy": {
        "id": "usr-uuid-002",
        "name": "Michael IT Staff",
        "email": "staff1@toktickit.com",
        "role": "STAFF"
      },
      "assigneeId": "usr-uuid-002",
      "assignee": {
        "id": "usr-uuid-002",
        "name": "Michael IT Staff",
        "email": "staff1@toktickit.com",
        "role": "STAFF"
      },
      "actionDateTime": "2026-10-30T10:15:00.000Z",
      "status": "COMPLETED",
      "description": "Inspected network switch ports and reset VLAN configuration.",
      "result": "Port 4 is operational. Host regained IP address.",
      "followUpRequired": true,
      "followUpNote": "Monitor connection stability over the next 24 hours.",
      "attachmentNotes": "router-diagnostic.log",
      "version": 2,
      "createdAt": "2026-10-30T10:15:30.000Z",
      "updatedAt": "2026-10-30T10:20:00.000Z"
    }
  ]
}
```
* **Error Responses:**
  - `401 Unauthorized`: Not logged in.
  - `403 Forbidden`: Authenticated user is a Requester and does not own ticket `:id`.
  - `404 Not Found`: Ticket `:id` does not exist.

---

### 2.2 Create Action Taken
* **URL:** `POST /api/tickets/:id/actions`
* **Access:** IT Staff, Administrator
* **Request Body:**
```json
{
  "actionDateTime": "2026-10-30T10:15:00.000Z",
  "assigneeId": "usr-uuid-002",
  "status": "PENDING",
  "description": "Replaced thermal paste and cleared dust from CPU heatsink.",
  "result": null,
  "followUpRequired": false,
  "followUpNote": null,
  "attachmentNotes": "temp-benchmark.png"
}
```
* **Validation & Business Rules:**
  - `description`: String, mandatory, 1–2,000 characters, non-whitespace.
  - `status`: String enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`). Defaults to `PENDING` if omitted.
  - `result`: Optional when `status` is `PENDING` or `IN_PROGRESS`. Strictly required (1–2,000 non-whitespace characters) if `status` is `COMPLETED`.
  - `assigneeId`: Optional string. If provided, must reference an active User (`isActive: true`) with role `STAFF` or `ADMIN`. Assigning to an inactive or non-staff user returns HTTP 400:
    ```json
    { "code": "INACTIVE_ASSIGNEE", "error": "Cannot assign action to an inactive user or non-staff role." }
    ```
  - `followUpRequired`: Boolean, defaults to `false`.
  - `followUpNote`: String, 1–1,000 characters if `followUpRequired = true`. Must be null or omitted if `false`.
  - `performedById`: Automatically taken from the authenticated user session (client input ignored).
* **Success Response (201 Created):**
```json
{
  "message": "Action Taken recorded successfully",
  "action": {
    "id": "act-uuid-002",
    "ticketId": "tkt-uuid-012",
    "performedById": "usr-uuid-002",
    "assigneeId": "usr-uuid-002",
    "status": "PENDING",
    "actionDateTime": "2026-10-30T10:15:00.000Z",
    "description": "Replaced thermal paste and cleared dust from CPU heatsink.",
    "result": null,
    "followUpRequired": false,
    "followUpNote": null,
    "attachmentNotes": "temp-benchmark.png",
    "version": 1,
    "createdAt": "2026-10-30T10:16:00.000Z",
    "updatedAt": "2026-10-30T10:16:00.000Z"
  }
}
```
* **Error Responses:**
  - `400 Bad Request`: Missing mandatory fields, `INACTIVE_ASSIGNEE`, or missing result when completed.
  - `403 Forbidden`: Requester role attempting write operation.

---

### 2.3 Update Existing Action Taken (Lifecycle, Reassignment & Terminal Lock)
* **URL:** `PATCH /api/tickets/:ticketId/actions/:actionId`
* **Access:** IT Staff, Administrator
* **Request Body:**
```json
{
  "status": "COMPLETED",
  "result": "CPU thermal stress test passed at 52C under full synthetic load.",
  "assigneeId": "usr-uuid-002",
  "followUpRequired": false,
  "followUpNote": null,
  "attachmentNotes": "stress-test-pass.png",
  "expectedVersion": 1
}
```
* **Validation & Business Rules:**
  - **Terminal Lock:** If the action's current database status is `COMPLETED` or `CANCELLED`, reject modification:
    ```json
    { "code": "TERMINAL_ACTION_LOCKED", "error": "Completed or cancelled actions are permanently locked." }
    ```
  - **Inactive Assignee Check:** If `assigneeId` is modified, verify the new assignee is active (`isActive: true`) and staff/admin. If inactive, reject with `400 INACTIVE_ASSIGNEE`.
  - **Completion Validation:** Transitioning status to `COMPLETED` requires a non-empty `result`.
  - **Optimistic Concurrency Control:** Executes atomic predicate inside transaction:
    ```typescript
    const updated = await prisma.actionTaken.updateMany({
      where: { id: actionId, ticketId, version: expectedVersion },
      data: { ...updatePayload, version: expectedVersion + 1 }
    });
    if (updated.count === 0) return res.status(409).json({ error: "Action Taken has been updated by another user." });
    ```
* **Success Response (200 OK):** Returns the updated `action` object with incremented `version`.
* **Error Responses:**
  - `400 Bad Request`: Validation failure, terminal lock violation, or inactive assignee.
  - `404 Not Found`: Action or Ticket not found.
  - `409 Conflict`: `expectedVersion` does not match the current database row.

---

### 2.4 Get Ticket Status Audit History
* **URL:** `GET /api/tickets/:id/history`
* **Access:** Requester (owned ticket only), IT Staff, Administrator
* **Success Response (200 OK):**
```json
{
  "history": [
    {
      "id": "hist-uuid-001",
      "ticketId": "tkt-uuid-012",
      "fromStatus": "NEW",
      "toStatus": "IN_PROGRESS",
      "changedById": "usr-uuid-002",
      "changedBy": {
        "id": "usr-uuid-002",
        "name": "Michael IT Staff",
        "email": "staff1@toktickit.com"
      },
      "changedAt": "2026-10-30T09:15:00.000Z"
    },
    {
      "id": "hist-uuid-002",
      "ticketId": "tkt-uuid-012",
      "fromStatus": "IN_PROGRESS",
      "toStatus": "RESOLVED",
      "changedById": "usr-uuid-002",
      "changedBy": {
        "id": "usr-uuid-002",
        "name": "Michael IT Staff",
        "email": "staff1@toktickit.com"
      },
      "changedAt": "2026-10-30T10:30:00.000Z"
    }
  ]
}
```

---

## 3. Ticket Workflow & Resolution Gate Endpoints

### 3.1 Update Ticket Status (with Resolution Gate, History, & Atomic Concurrency)
* **URL:** `PATCH /api/staff/tickets/:id/status`
* **Access:** IT Staff, Administrator
* **Request Body:**
```json
{
  "status": "RESOLVED",
  "expectedVersion": 2
}
```
* **Business Logic & Guards:**
  1. **Status Transition Matrix:** Validates status transition from current status. Illegal transitions return HTTP `400 Bad Request`.
  2. **Resolution Gate Enforcement (when target status is `RESOLVED`):**
     - **Owner Assigned:** Checks `ticket.ownerId !== null`. If null, rejects:
       ```json
       { "code": "RESOLUTION_GATE_FAILED", "error": "Resolution Gate: Ticket must be assigned to an IT Staff owner before resolving." }
       ```
     - **Completed Action Taken with Result:** Checks for at least one `ActionTaken` with `status === "COMPLETED"` and non-empty `result`. If none found, rejects:
       ```json
       { "code": "RESOLUTION_GATE_FAILED", "error": "Resolution Gate: Ticket cannot be marked as RESOLVED without at least one completed Action Taken with an outcome result." }
       ```
     - **Follow-Up Notes Satisfied:** Checks all actions where `followUpRequired === true`. If any action has a null or empty `followUpNote`, rejects:
       ```json
       { "code": "RESOLUTION_GATE_FAILED", "error": "Resolution Gate: All actions requiring follow-up must have documented follow-up notes." }
       ```
  3. **Atomic Transaction with Version Predicate & History Append:**
     Executes within a Prisma transaction:
     ```typescript
     await prisma.$transaction(async (tx) => {
       const updated = await tx.ticket.updateMany({
         where: { id: ticketId, version: expectedVersion },
         data: { status: newStatus, version: expectedVersion + 1 }
       });
       if (updated.count === 0) {
         throw new ConcurrencyError("Ticket modified concurrently");
       }
       await tx.ticketStatusHistory.create({
         data: {
           ticketId,
           fromStatus: ticket.status,
           toStatus: newStatus,
           changedById: staffUser.id
         }
       });
     });
     ```
* **Success Response (200 OK):**
```json
{
  "message": "Ticket status updated successfully",
  "ticket": {
    "id": "tkt-uuid-012",
    "ticketNumber": "TKT-2026-000012",
    "status": "RESOLVED",
    "version": 3,
    "updatedAt": "2026-10-30T10:30:00.000Z"
  }
}
```
* **Error Responses:**
  - `400 Bad Request`: Illegal status jump or Resolution Gate prerequisite failure (`RESOLUTION_GATE_FAILED`).
  - `409 Conflict`: Stale `expectedVersion` detected; concurrent update prevented.

---

### 3.2 Requester Problem Appears Resolved Indicator
* **URL:** `PATCH /api/tickets/:id/resolve-indicator`
* **Access:** Requester (ticket owner only)
* **Request Body:**
```json
{
  "problemAppearsResolved": true
}
```
* **Business Logic:** Sets the advisory flag `problemAppearsResolved`. Does NOT alter the authoritative `ticket.status`.
* **Success Response (200 OK):**
```json
{
  "message": "Problem resolution indicator updated",
  "problemAppearsResolved": true
}
```

---

## 4. Role-Appropriate Dashboard Endpoints

### 4.1 Requester Dashboard Data
* **URL:** `GET /api/dashboard/requester`
* **Access:** Requester (and Admin for verification)
* **Success Response (200 OK):**
```json
{
  "metrics": {
    "myOpenTickets": 3,
    "waitingForRequester": 1,
    "recentlyResolved": 5
  },
  "recentTickets": [
    {
      "id": "tkt-uuid-012",
      "ticketNumber": "TKT-2026-000012",
      "summary": "VPN connection drops every 15 minutes",
      "status": "IN_PROGRESS",
      "requestedPriority": "HIGH",
      "itPriority": "HIGH",
      "version": 2,
      "updatedAt": "2026-10-30T09:45:00.000Z"
    }
  ]
}
```

---

### 4.2 IT Staff & Administrator Dashboard Data
* **URL:** `GET /api/dashboard/staff`
* **Access:** IT Staff, Administrator
* **Success Response (200 OK):**
```json
{
  "metrics": {
    "newTickets": 14,
    "openTickets": 23,
    "inProgressTickets": 18,
    "waitingForRequester": 7,
    "myAssignedTickets": 16,
    "unassignedTickets": 8
  },
  "ticketsByPriority": {
    "URGENT": 4,
    "HIGH": 12,
    "MEDIUM": 25,
    "LOW": 37
  },
  "recentQueueTickets": [
    {
      "id": "tkt-uuid-045",
      "ticketNumber": "TKT-2026-000045",
      "summary": "Laptop battery drains quickly",
      "status": "IN_PROGRESS",
      "itPriority": "MEDIUM",
      "version": 1,
      "owner": {
        "id": "usr-uuid-002",
        "name": "Michael IT Staff"
      },
      "updatedAt": "2026-10-30T10:14:00.000Z"
    }
  ],
  "adminStats": {
    "totalUsers": 12,
    "activeStaff": 3,
    "activeRequesters": 8
  }
}
```
* **Error Response:**
  - `403 Forbidden`: Requester accessing Staff dashboard endpoint.
