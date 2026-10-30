# REST API Specification (Sprint 4)

## 1. Authentication & Security Conventions
All Sprint 4 endpoints require a valid authenticated session established via `HttpOnly` JWT cookies (`token`).
* **401 Unauthorized:** Returned if the JWT cookie is missing, expired, or invalid.
* **403 Forbidden:** Returned if an authenticated user lacks the required role (e.g. Requester calling IT Staff endpoints) or attempts to access another user's ticket resources.
* **404 Not Found:** Returned if the requested Ticket or Action Taken ID does not exist in the database.
* **409 Conflict:** Returned during optimistic concurrency checks when a ticket was modified by another session since it was retrieved.

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
      "id": 101,
      "ticketId": 12,
      "performedById": 2,
      "performedBy": {
        "id": 2,
        "name": "Michael IT Staff",
        "email": "staff1@toktickit.com",
        "role": "STAFF"
      },
      "actionDateTime": "2026-10-30T10:15:00.000Z",
      "description": "Inspected network switch ports and reset VLAN configuration.",
      "result": "Port 4 is operational. Host regained IP address.",
      "followUpRequired": true,
      "followUpNote": "Monitor connection stability over the next 24 hours.",
      "attachmentNotes": "router-diagnostic.log",
      "createdAt": "2026-10-30T10:15:30.000Z",
      "updatedAt": "2026-10-30T10:15:30.000Z"
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
  "description": "Replaced thermal paste and cleared dust from CPU heatsink.",
  "result": "System temperature stabilized under 45C at full load.",
  "followUpRequired": false,
  "followUpNote": null,
  "attachmentNotes": "temp-benchmark.png"
}
```
* **Validation Rules:**
  - `description`: String, 1–2,000 characters, non-whitespace.
  - `result`: String, 1–2,000 characters, non-whitespace.
  - `followUpRequired`: Boolean.
  - `followUpNote`: String, 1–1,000 characters if `followUpRequired = true`. Must be null or omitted if `false`.
  - `performedById`: Automatically taken from the authenticated user session (client values ignored).
* **Success Response (201 Created):**
```json
{
  "message": "Action Taken recorded successfully",
  "action": {
    "id": 102,
    "ticketId": 12,
    "performedById": 2,
    "actionDateTime": "2026-10-30T10:15:00.000Z",
    "description": "Replaced thermal paste and cleared dust from CPU heatsink.",
    "result": "System temperature stabilized under 45C at full load.",
    "followUpRequired": false,
    "followUpNote": null,
    "attachmentNotes": "temp-benchmark.png",
    "createdAt": "2026-10-30T10:16:00.000Z",
    "updatedAt": "2026-10-30T10:16:00.000Z"
  }
}
```
* **Error Responses:**
  - `400 Bad Request`: Missing mandatory fields or `followUpRequired=true` without `followUpNote`.
  - `403 Forbidden`: Requester role attempting write operation.

---

### 2.3 Update Existing Action Taken
* **URL:** `PATCH /api/tickets/:ticketId/actions/:actionId`
* **Access:** IT Staff, Administrator
* **Request Body:**
```json
{
  "description": "Updated diagnostic details.",
  "result": "Issue completely verified and resolved.",
  "followUpRequired": false,
  "followUpNote": null,
  "attachmentNotes": "verified-test.log"
}
```
* **Success Response (200 OK):** Returns the updated `action` object.
* **Error Responses:**
  - `400 Bad Request`: Invalid validation data.
  - `404 Not Found`: Action or Ticket not found.

---

## 3. Ticket Workflow & Resolution Gate Endpoints

### 3.1 Update Ticket Status (with Resolution Gate & Concurrency)
* **URL:** `PATCH /api/staff/tickets/:id/status`
* **Access:** IT Staff, Administrator
* **Request Body:**
```json
{
  "status": "RESOLVED",
  "expectedUpdatedAt": "2026-10-30T09:00:00.000Z"
}
```
* **Business Logic & Guards:**
  1. Validates status against the **Status Transition Matrix**. Illegal jumps return `400 Bad Request`.
  2. If `status` is `RESOLVED`: checks `COUNT(actionsTaken)` for this ticket. If count is 0, rejects with `400 Bad Request`:
     ```json
     { "error": "Resolution Gate: Ticket cannot be marked as RESOLVED without at least one recorded Action Taken." }
     ```
  3. If `expectedUpdatedAt` is provided, verifies that `ticket.updatedAt.toISOString() === expectedUpdatedAt`. If mismatch, rejects with `409 Conflict`.
* **Success Response (200 OK):**
```json
{
  "message": "Ticket status updated successfully",
  "ticket": {
    "id": 12,
    "ticketNumber": "TKT-2026-000012",
    "status": "RESOLVED",
    "updatedAt": "2026-10-30T10:30:00.000Z"
  }
}
```

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
      "id": 12,
      "ticketNumber": "TKT-2026-000012",
      "summary": "VPN connection drops every 15 minutes",
      "status": "IN_PROGRESS",
      "requestedPriority": "HIGH",
      "itPriority": "HIGH",
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
      "id": 45,
      "ticketNumber": "TKT-2026-000045",
      "summary": "Laptop battery drains quickly",
      "status": "IN_PROGRESS",
      "itPriority": "MEDIUM",
      "owner": {
        "id": 2,
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
