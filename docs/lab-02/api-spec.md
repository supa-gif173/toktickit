# Lab 2 Sprint: API Specification

This document provides a comprehensive contract for the backend implementation of the Ticket Management System (Lab 2).

## Global Rules

### 1. Data Isolation & Mock Authentication
The system relies on a Development Requester mock authentication pattern. All secured endpoints (endpoints accessing or modifying Tickets or Attachments) MUST enforce data isolation by reading the custom HTTP header `X-Requester-Id`. 

**Header:**
- `X-Requester-Id`: UUID string representing the active mock user.

**Validation Rules:**
- If the header is missing or empty on a secured endpoint, the server MUST return `401 Unauthorized`.
- If the header value does not correspond to an active Requester in the database, the server MUST return `401 Unauthorized`.
- On read/update/delete operations for specific resources (Tickets, Attachments), the server MUST ensure that the resource explicitly belongs to the `X-Requester-Id`. If it does not, return `403 Forbidden` (or `404 Not Found` to prevent data leakage).

### 2. Standard Error Response
Unless specified otherwise, validation errors will return a standard structure:
```json
{
  "error": "Bad Request",
  "message": "A descriptive error message",
  "details": [
    "Field 'summary' is required."
  ]
}
```

---

## Endpoint Details

### 1. Retrieve active Categories
**Endpoint:** `GET /api/categories`
**Description:** Retrieves a list of all active categories for use in the ticket creation form.
**Security:** Public or valid `X-Requester-Id` depending on global policy, typically public for lookup data.

**Request Parameters:** None

**Expected Responses:**
- **200 OK (Success)**
  ```json
  [
    {
      "id": "cat-uuid-1",
      "name": "Hardware",
      "isActive": true
    },
    {
      "id": "cat-uuid-2",
      "name": "Software",
      "isActive": true
    }
  ]
  ```

---

### 2. Retrieve active Related Systems
**Endpoint:** `GET /api/systems`
**Description:** Retrieves a list of all active related systems for use in the ticket creation form.
**Security:** Public or valid `X-Requester-Id`.

**Request Parameters:** None

**Expected Responses:**
- **200 OK (Success)**
  ```json
  [
    {
      "id": "sys-uuid-1",
      "name": "ERP System",
      "isActive": true
    },
    {
      "id": "sys-uuid-2",
      "name": "Email Server",
      "isActive": true
    }
  ]
  ```

---

### 3. Retrieve active Development Requesters
**Endpoint:** `GET /api/requesters`
**Description:** Fetches all active requesters to populate the mock selection screen.
**Security:** Public.

**Request Parameters:** None

**Expected Responses:**
- **200 OK (Success)**
  ```json
  [
    {
      "id": "req-uuid-1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "department": "Engineering"
    },
    {
      "id": "req-uuid-2",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "department": "HR"
    }
  ]
  ```

---

### 4. Create a Ticket
**Endpoint:** `POST /api/tickets`
**Description:** Creates a new ticket on behalf of the selected requester. The initial status MUST be set to "New", and a unique `ticketNumber` MUST be generated. 
**Security:** Requires valid `X-Requester-Id` header.

**Request Parameters:** 
- **Header:** `X-Requester-Id` (Required)
- **Body:** JSON Schema
  ```json
  {
    "summary": "Cannot access ERP system",
    "description": "I get a 500 error when trying to log in.",
    "categoryId": "cat-uuid-2",
    "systemId": "sys-uuid-1",
    "attachments": ["attach-uuid-1", "attach-uuid-2"] // Array of attachment IDs previously uploaded
  }
  ```

**Expected Responses:**
- **201 Created (Success)**
  ```json
  {
    "id": "ticket-uuid-1",
    "ticketNumber": "INC-10001",
    "summary": "Cannot access ERP system",
    "description": "I get a 500 error when trying to log in.",
    "status": "New",
    "requesterId": "req-uuid-1",
    "categoryId": "cat-uuid-2",
    "systemId": "sys-uuid-1",
    "createdAt": "2026-09-03T14:31:47Z",
    "updatedAt": "2026-09-03T14:31:47Z",
    "attachments": [
      {
        "id": "attach-uuid-1",
        "fileName": "screenshot.png",
        "mimeType": "image/png"
      }
    ]
  }
  ```
- **400 Bad Request (Validation Failure)**
  ```json
  {
    "error": "Bad Request",
    "message": "Validation failed",
    "details": ["'summary' is required.", "'categoryId' is invalid."]
  }
  ```
- **401 Unauthorized (Missing/Invalid Header)**

---

### 5. Retrieve the selected Requester's Tickets
**Endpoint:** `GET /api/tickets`
**Description:** Fetches a paginated, filtered, and sorted list of tickets exclusively owned by the active requester.
**Security:** Requires valid `X-Requester-Id` header.

**Request Parameters:**
- **Header:** `X-Requester-Id` (Required)
- **Query Params:**
  - `page` (optional, default 1)
  - `limit` (optional, default 10)
  - `search` (optional) - matches against `summary`
  - `status` (optional) - filters by status
  - `category` (optional) - filters by category ID
  - `sortBy` (optional, default `createdAt`)
  - `sortOrder` (optional, default `desc`)

**Expected Responses:**
- **200 OK (Success)**
  ```json
  {
    "data": [
      {
        "id": "ticket-uuid-1",
        "ticketNumber": "INC-10001",
        "summary": "Cannot access ERP system",
        "status": "New",
        "categoryId": "cat-uuid-2",
        "createdAt": "2026-09-03T14:31:47Z"
      }
    ],
    "meta": {
      "totalCount": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
  ```
- **401 Unauthorized** (Missing requester context)
- **403 Forbidden** (Invalid requester context)

---

### 6. Retrieve one owned Ticket
**Endpoint:** `GET /api/tickets/:id`
**Description:** Fetches full details for a specific ticket, including its attachments (excluding soft-removed ones). Must ensure the requester owns the ticket.
**Security:** Requires valid `X-Requester-Id` header.

**Request Parameters:**
- **Header:** `X-Requester-Id` (Required)
- **Path Variable:** `id` (Ticket UUID)

**Expected Responses:**
- **200 OK (Success)**
  ```json
  {
    "id": "ticket-uuid-1",
    "ticketNumber": "INC-10001",
    "summary": "Cannot access ERP system",
    "description": "I get a 500 error when trying to log in.",
    "status": "New",
    "requesterId": "req-uuid-1",
    "categoryId": "cat-uuid-2",
    "systemId": "sys-uuid-1",
    "createdAt": "2026-09-03T14:31:47Z",
    "updatedAt": "2026-09-03T14:31:47Z",
    "category": {
      "id": "cat-uuid-2",
      "name": "Software"
    },
    "system": {
      "id": "sys-uuid-1",
      "name": "ERP System"
    },
    "attachments": [
      {
        "id": "attach-uuid-1",
        "fileName": "screenshot.png",
        "fileSize": 102400,
        "mimeType": "image/png",
        "uploadedAt": "2026-09-03T14:30:00Z"
      }
    ]
  }
  ```
- **401 Unauthorized**
- **403 Forbidden** (Requester does not own the ticket)
- **404 Not Found** (Ticket doesn't exist)

---

### 7. Upload an Attachment
**Endpoint:** `POST /api/attachments`
**Description:** Uploads a file, storing it locally (Lab 2 requirement) and saving metadata in the database. 
- Maximum size: 5MB per file.
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
**Security:** Requires valid `X-Requester-Id` header.

**Request Parameters:**
- **Header:** `X-Requester-Id` (Required)
- **Body:** `multipart/form-data`
  - `file`: The file binary data.

**Expected Responses:**
- **201 Created (Success)**
  ```json
  {
    "id": "attach-uuid-1",
    "fileName": "screenshot.png",
    "fileSize": 102400,
    "mimeType": "image/png",
    "uploadedAt": "2026-09-03T14:30:00Z"
  }
  ```
- **400 Bad Request (Validation Failure)**
  ```json
  {
    "error": "Bad Request",
    "message": "File exceeds maximum size of 5MB."
  }
  ```
- **401 Unauthorized**

---

### 8. Retrieve Attachment metadata / Download an active Attachment
**Endpoint:** `GET /api/attachments/:id`
**Description:** Downloads or returns metadata for a file. If soft-removed (`deletedAt != null`), it MUST return 404 or 410. Access to the attachment must be validated against the requester's ownership of the parent ticket.
**Security:** Requires valid `X-Requester-Id` header.

**Request Parameters:**
- **Header:** `X-Requester-Id` (Required)
- **Path Variable:** `id` (Attachment UUID)
- **Query Params:** `download` (optional boolean, e.g. `?download=true` to force a download via `Content-Disposition` header)

**Expected Responses:**
- **200 OK (Success, Download)**
  - Response type depends on the file. If metadata requested:
  ```json
  {
    "id": "attach-uuid-1",
    "fileName": "screenshot.png",
    "fileSize": 102400,
    "mimeType": "image/png",
    "uploadedAt": "2026-09-03T14:30:00Z"
  }
  ```
  - If download, binary stream with correct `Content-Type`.
- **401 Unauthorized**
- **403 Forbidden** (Requester does not own the parent ticket)
- **404 Not Found** (Attachment does not exist or has been soft-removed)

---

### 9. Soft-remove an Attachment
**Endpoint:** `DELETE /api/attachments/:id`
**Description:** Marks an attachment as deleted by populating the `deletedAt` field (soft removal). The physical file remains, but the record is ignored in future active queries. Ownership must be validated before deletion.
**Security:** Requires valid `X-Requester-Id` header.

**Request Parameters:**
- **Header:** `X-Requester-Id` (Required)
- **Path Variable:** `id` (Attachment UUID)

**Expected Responses:**
- **200 OK (Success)**
  ```json
  {
    "message": "Attachment successfully removed."
  }
  ```
- **401 Unauthorized**
- **403 Forbidden** (Requester does not own the attachment's parent ticket)
- **404 Not Found** (Attachment missing or already removed)
