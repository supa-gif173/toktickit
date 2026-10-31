import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";

describe("Actions Taken & Ticket History API (Sprint 4 - Issue 2)", () => {
  let staffToken: string;
  let req1Token: string;
  let req2Token: string;
  let staffUser: any;
  let staff2User: any;
  let req1User: any;
  let req2User: any;
  let inactiveStaffUser: any;
  let testTicket: any;

  beforeAll(async () => {
    const prisma = getPrisma();

    // Ensure test users are active and do not require password change
    await prisma.user.updateMany({
      where: { email: { in: ["staff1@example.com", "staff2@example.com", "req1@example.com", "req2@example.com"] } },
      data: { mustChangePassword: false, isActive: true }
    });

    // 1. Staff 1 login
    const resStaff = await request(app).post("/api/auth/login").send({
      email: "staff1@example.com",
      password: "Password123!"
    });
    staffToken = resStaff.headers["set-cookie"][0].split(";")[0];
    staffUser = await prisma.user.findUnique({ where: { email: "staff1@example.com" } });
    staff2User = await prisma.user.findUnique({ where: { email: "staff2@example.com" } });
    inactiveStaffUser = await prisma.user.findUnique({ where: { email: "staff-inactive@example.com" } });

    // 2. Requester 1 login
    const resReq1 = await request(app).post("/api/auth/login").send({
      email: "req1@example.com",
      password: "Password123!"
    });
    req1Token = resReq1.headers["set-cookie"][0].split(";")[0];
    req1User = await prisma.user.findUnique({ where: { email: "req1@example.com" } });

    // 3. Requester 2 login
    const resReq2 = await request(app).post("/api/auth/login").send({
      email: "req2@example.com",
      password: "Password123!"
    });
    req2Token = resReq2.headers["set-cookie"][0].split(";")[0];
    req2User = await prisma.user.findUnique({ where: { email: "req2@example.com" } });

    const category = await prisma.category.findFirst();
    const system = await prisma.relatedSystem.findFirst();

    // Create isolated test ticket for req1
    testTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `INC-ACT-${Date.now()}`,
        summary: "Actions Taken Test Ticket",
        description: "Test ticket for validating actions taken workflows",
        status: "OPEN",
        requesterId: req1User.id,
        categoryId: category!.id,
        systemId: system!.id,
        version: 1
      }
    });
  });

  afterAll(async () => {
    const prisma = getPrisma();
    if (testTicket) {
      await prisma.actionTaken.deleteMany({ where: { ticketId: testTicket.id } }).catch(() => {});
      await prisma.ticketStatusHistory.deleteMany({ where: { ticketId: testTicket.id } }).catch(() => {});
      await prisma.ticket.delete({ where: { id: testTicket.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("API-01: Create valid Action Taken by IT Staff", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicket.id}/actions`)
      .set("Cookie", staffToken)
      .send({
        description: "Inspected network interface and verified route table.",
        assigneeId: staffUser.id,
        status: "PENDING",
        followUpRequired: false
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Action Taken recorded successfully");
    expect(res.body.action).toBeDefined();
    expect(res.body.action.description).toBe("Inspected network interface and verified route table.");
    expect(res.body.action.status).toBe("PENDING");
    expect(res.body.action.performedById).toBe(staffUser.id);
    expect(res.body.action.assigneeId).toBe(staffUser.id);
    expect(res.body.action.version).toBe(1);
    expect(res.body.action.performedBy.email).toBe("staff1@example.com");
  });

  it("API-02: Requester attempts to create Action Taken -> 403 Forbidden", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicket.id}/actions`)
      .set("Cookie", req1Token)
      .send({
        description: "Requester trying to record an action directly",
        status: "PENDING"
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  it("API-03: Requester retrieves actions for other user's ticket -> 403 Forbidden", async () => {
    const res = await request(app)
      .get(`/api/tickets/${testTicket.id}/actions`)
      .set("Cookie", req2Token);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  it("Allows ticket owner Requester to view Actions Taken", async () => {
    const res = await request(app)
      .get(`/api/tickets/${testTicket.id}/actions`)
      .set("Cookie", req1Token);

    expect(res.status).toBe(200);
    expect(res.body.actions).toBeInstanceOf(Array);
    expect(res.body.actions.length).toBeGreaterThanOrEqual(1);
  });

  it("API-04: Action creation with followUpRequired=true but missing followUpNote -> 400 Bad Request", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicket.id}/actions`)
      .set("Cookie", staffToken)
      .send({
        description: "Replaced faulty Ethernet patch cable.",
        followUpRequired: true,
        followUpNote: "" // Empty follow-up note
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Bad Request");
  });

  it("API-14: Assign Action Taken to inactive user or non-staff -> 400 Bad Request (INACTIVE_ASSIGNEE)", async () => {
    // 1. Attempt assigning to inactive staff
    const resInactive = await request(app)
      .post(`/api/tickets/${testTicket.id}/actions`)
      .set("Cookie", staffToken)
      .send({
        description: "Diagnose system crash dump.",
        assigneeId: inactiveStaffUser.id
      });

    expect(resInactive.status).toBe(400);
    expect(resInactive.body.code).toBe("INACTIVE_ASSIGNEE");

    // 2. Attempt assigning to a Requester
    const resRequesterAssignee = await request(app)
      .post(`/api/tickets/${testTicket.id}/actions`)
      .set("Cookie", staffToken)
      .send({
        description: "Diagnose system crash dump.",
        assigneeId: req1User.id
      });

    expect(resRequesterAssignee.status).toBe(400);
    expect(resRequesterAssignee.body.code).toBe("INACTIVE_ASSIGNEE");
  });

  it("API-05: Update existing Action Taken in PENDING state -> 200 OK and increments version", async () => {
    // Create an action to update
    const createRes = await request(app)
      .post(`/api/tickets/${testTicket.id}/actions`)
      .set("Cookie", staffToken)
      .send({
        description: "Initial diagnostic scan.",
        status: "PENDING"
      });
    expect(createRes.status).toBe(201);
    const actionId = createRes.body.action.id;

    // Update description and transition to IN_PROGRESS
    const updateRes = await request(app)
      .patch(`/api/tickets/${testTicket.id}/actions/${actionId}`)
      .set("Cookie", staffToken)
      .send({
        description: "Diagnostic scan completed. Found corrupted network driver.",
        status: "IN_PROGRESS",
        assigneeId: staff2User.id
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.action.status).toBe("IN_PROGRESS");
    expect(updateRes.body.action.version).toBe(2);
    expect(updateRes.body.action.assigneeId).toBe(staff2User.id);
  });

  it("API-15: Complete action requires result, and completed action enforces terminal lock", async () => {
    // 1. Create a pending action
    const createRes = await request(app)
      .post(`/api/tickets/${testTicket.id}/actions`)
      .set("Cookie", staffToken)
      .send({
        description: "Apply firmware update to BIOS.",
        status: "IN_PROGRESS"
      });
    expect(createRes.status).toBe(201);
    const actionId = createRes.body.action.id;

    // 2. Attempt transitioning to COMPLETED without result -> 400 Bad Request
    const failCompleteRes = await request(app)
      .patch(`/api/tickets/${testTicket.id}/actions/${actionId}`)
      .set("Cookie", staffToken)
      .send({
        status: "COMPLETED",
        result: "   " // whitespace only
      });
    expect(failCompleteRes.status).toBe(400);

    // 3. Complete action with valid result -> 200 OK
    const successCompleteRes = await request(app)
      .patch(`/api/tickets/${testTicket.id}/actions/${actionId}`)
      .set("Cookie", staffToken)
      .send({
        status: "COMPLETED",
        result: "BIOS successfully flashed to version 2.4.1. System boots cleanly."
      });
    expect(successCompleteRes.status).toBe(200);
    expect(successCompleteRes.body.action.status).toBe("COMPLETED");

    // 4. Attempt to modify COMPLETED action -> 400 TERMINAL_ACTION_LOCKED
    const lockRes = await request(app)
      .patch(`/api/tickets/${testTicket.id}/actions/${actionId}`)
      .set("Cookie", staffToken)
      .send({
        description: "Trying to edit a finished action"
      });
    expect(lockRes.status).toBe(400);
    expect(lockRes.body.code).toBe("TERMINAL_ACTION_LOCKED");
  });

  it("API-17: Optimistic concurrency collision on Action Taken update (expectedVersion mismatch) -> 409 Conflict", async () => {
    // 1. Create action
    const createRes = await request(app)
      .post(`/api/tickets/${testTicket.id}/actions`)
      .set("Cookie", staffToken)
      .send({
        description: "Check temperature sensors.",
        status: "PENDING"
      });
    expect(createRes.status).toBe(201);
    const actionId = createRes.body.action.id;
    const currentVersion = createRes.body.action.version; // 1

    // 2. Update with stale version (e.g. 999) -> 409 Conflict
    const conflictRes = await request(app)
      .patch(`/api/tickets/${testTicket.id}/actions/${actionId}`)
      .set("Cookie", staffToken)
      .send({
        description: "Conflicting update from stale tab",
        expectedVersion: 999
      });
    expect(conflictRes.status).toBe(409);
    expect(conflictRes.body.error).toBe("Conflict");

    // 3. Update with matching expectedVersion -> 200 OK
    const validUpdateRes = await request(app)
      .patch(`/api/tickets/${testTicket.id}/actions/${actionId}`)
      .set("Cookie", staffToken)
      .send({
        description: "Sensors are within normal range.",
        expectedVersion: currentVersion
      });
    expect(validUpdateRes.status).toBe(200);
    expect(validUpdateRes.body.action.version).toBe(currentVersion + 1);
  });

  it("Ticket Status History: GET /api/tickets/:id/history returns audit trail", async () => {
    // Create an audit history row for testTicket
    const prisma = getPrisma();
    await prisma.ticketStatusHistory.create({
      data: {
        ticketId: testTicket.id,
        fromStatus: "NEW",
        toStatus: "OPEN",
        changedById: staffUser.id
      }
    });

    // 1. Requester owner can view history
    const resReq = await request(app)
      .get(`/api/tickets/${testTicket.id}/history`)
      .set("Cookie", req1Token);
    expect(resReq.status).toBe(200);
    expect(resReq.body.history).toBeInstanceOf(Array);
    expect(resReq.body.history.length).toBeGreaterThanOrEqual(1);
    expect(resReq.body.history[0].fromStatus).toBe("NEW");
    expect(resReq.body.history[0].toStatus).toBe("OPEN");
    expect(resReq.body.history[0].changedBy.email).toBe("staff1@example.com");

    // 2. Non-owner requester is forbidden
    const resForbidden = await request(app)
      .get(`/api/tickets/${testTicket.id}/history`)
      .set("Cookie", req2Token);
    expect(resForbidden.status).toBe(403);
  });
});
