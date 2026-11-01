import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";
import bcrypt from "bcrypt";

describe("Ticket Workflow, Resolution Gate & Concurrency API (Sprint 4 - Issue 4)", () => {
  let staffToken: string;
  let reqToken: string;
  let otherReqToken: string;
  let staffUser: any;
  let reqUser: any;
  let otherReqUser: any;
  let categoryId: string;
  let systemId: string;

  beforeAll(async () => {
    const prisma = getPrisma();
    const passwordHash = await bcrypt.hash("Password123!", 10);

    // Upsert dedicated test users to ensure complete test isolation
    staffUser = await prisma.user.upsert({
      where: { email: "wf-staff@example.com" },
      update: { mustChangePassword: false, isActive: true, role: "STAFF" },
      create: {
        name: "Workflow Staff",
        email: "wf-staff@example.com",
        passwordHash,
        role: "STAFF",
        isActive: true,
        mustChangePassword: false,
      }
    });

    reqUser = await prisma.user.upsert({
      where: { email: "wf-req1@example.com" },
      update: { mustChangePassword: false, isActive: true, role: "REQUESTER" },
      create: {
        name: "Workflow Requester 1",
        email: "wf-req1@example.com",
        passwordHash,
        role: "REQUESTER",
        isActive: true,
        mustChangePassword: false,
      }
    });

    otherReqUser = await prisma.user.upsert({
      where: { email: "wf-req2@example.com" },
      update: { mustChangePassword: false, isActive: true, role: "REQUESTER" },
      create: {
        name: "Workflow Requester 2",
        email: "wf-req2@example.com",
        passwordHash,
        role: "REQUESTER",
        isActive: true,
        mustChangePassword: false,
      }
    });

    // 1. Staff login
    const resStaff = await request(app).post("/api/auth/login").send({
      email: "wf-staff@example.com",
      password: "Password123!"
    });
    staffToken = resStaff.headers["set-cookie"][0].split(";")[0];

    // 2. Requester login
    const resReq = await request(app).post("/api/auth/login").send({
      email: "wf-req1@example.com",
      password: "Password123!"
    });
    reqToken = resReq.headers["set-cookie"][0].split(";")[0];

    // 3. Other Requester login
    const resOtherReq = await request(app).post("/api/auth/login").send({
      email: "wf-req2@example.com",
      password: "Password123!"
    });
    otherReqToken = resOtherReq.headers["set-cookie"][0].split(";")[0];

    const category = await prisma.category.findFirst();
    const system = await prisma.relatedSystem.findFirst();
    categoryId = category!.id;
    systemId = system!.id;
  });

  beforeEach(async () => {
    const prisma = getPrisma();
    await prisma.user.update({
      where: { id: staffUser.id },
      data: { mustChangePassword: false, isActive: true, role: "STAFF" }
    });
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.ticketStatusHistory.deleteMany({
      where: { ticket: { summary: { contains: "Workflow Test Ticket" } } }
    });
    await prisma.actionTaken.deleteMany({
      where: { ticket: { summary: { contains: "Workflow Test Ticket" } } }
    });
    await prisma.ticket.deleteMany({
      where: { summary: { contains: "Workflow Test Ticket" } }
    });
    await prisma.user.deleteMany({
      where: { email: { in: ["wf-staff@example.com", "wf-req1@example.com", "wf-req2@example.com"] } }
    });
  });

  // API-08: Illegal status transition
  it("API-08: rejects illegal status transition directly from NEW to RESOLVED with HTTP 400", async () => {
    const prisma = getPrisma();
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `INC-WF-${Date.now()}-1`,
        summary: "Workflow Test Ticket 1",
        description: "Testing invalid status transition",
        status: "NEW",
        requesterId: reqUser.id,
        categoryId,
        systemId,
        version: 1
      }
    });

    const res = await request(app)
      .patch(`/api/staff/tickets/${ticket.id}/status`)
      .set("Cookie", staffToken)
      .send({ status: "RESOLVED" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Bad Request");
    expect(res.body.message).toMatch(/invalid status transition/i);
  });

  // API-06: Resolve ticket without any Actions Taken (Resolution Gate)
  it("API-06: blocks resolution when ticket has zero Actions Taken with RESOLUTION_GATE_FAILED (HTTP 400)", async () => {
    const prisma = getPrisma();
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `INC-WF-${Date.now()}-2`,
        summary: "Workflow Test Ticket 2",
        description: "Testing resolution gate zero actions",
        status: "OPEN",
        ownerId: staffUser.id,
        requesterId: reqUser.id,
        categoryId,
        systemId,
        version: 1
      }
    });

    const res = await request(app)
      .patch(`/api/staff/tickets/${ticket.id}/status`)
      .set("Cookie", staffToken)
      .send({ status: "RESOLVED" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("RESOLUTION_GATE_FAILED");
    expect(res.body.message).toMatch(/without at least one completed Action Taken/i);
  });

  // API-18: Resolution Gate prerequisites: unassigned ticket owner and incomplete follow-up note
  it("API-18: blocks resolution when ticket is unassigned or has incomplete follow-up notes (HTTP 400)", async () => {
    const prisma = getPrisma();

    // 1. Unassigned ticket test
    const unassignedTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `INC-WF-${Date.now()}-3a`,
        summary: "Workflow Test Ticket 3a",
        description: "Testing unassigned owner check",
        status: "IN_PROGRESS",
        ownerId: null, // Unassigned
        requesterId: reqUser.id,
        categoryId,
        systemId,
        version: 1
      }
    });

    // Add a completed action to unassignedTicket
    await prisma.actionTaken.create({
      data: {
        ticketId: unassignedTicket.id,
        performedById: staffUser.id,
        status: "COMPLETED",
        description: "Diagnostics performed",
        result: "Root cause discovered",
        version: 1
      }
    });

    const resUnassigned = await request(app)
      .patch(`/api/staff/tickets/${unassignedTicket.id}/status`)
      .set("Cookie", staffToken)
      .send({ status: "RESOLVED" });

    expect(resUnassigned.status).toBe(400);
    expect(resUnassigned.body.code).toBe("RESOLUTION_GATE_FAILED");
    expect(resUnassigned.body.message).toMatch(/must be assigned to an IT Staff owner/i);

    // 2. Incomplete follow-up note test
    const followUpTicket = await prisma.ticket.create({
      data: {
        ticketNumber: `INC-WF-${Date.now()}-3b`,
        summary: "Workflow Test Ticket 3b",
        description: "Testing incomplete follow-up check",
        status: "IN_PROGRESS",
        ownerId: staffUser.id,
        requesterId: reqUser.id,
        categoryId,
        systemId,
        version: 1
      }
    });

    // Add action with followUpRequired=true but missing followUpNote (manually set in DB)
    await prisma.actionTaken.create({
      data: {
        ticketId: followUpTicket.id,
        performedById: staffUser.id,
        status: "COMPLETED",
        description: "Diagnostics performed",
        result: "Root cause discovered",
        followUpRequired: true,
        followUpNote: null,
        version: 1
      }
    });

    const resFollowUp = await request(app)
      .patch(`/api/staff/tickets/${followUpTicket.id}/status`)
      .set("Cookie", staffToken)
      .send({ status: "RESOLVED" });

    expect(resFollowUp.status).toBe(400);
    expect(resFollowUp.body.code).toBe("RESOLUTION_GATE_FAILED");
    expect(resFollowUp.body.message).toMatch(/must have documented follow-up notes/i);
  });

  // API-07: Resolve ticket meeting all Resolution Gate prerequisites
  it("API-07: successfully transitions ticket to RESOLVED when all prerequisites are met (HTTP 200)", async () => {
    const prisma = getPrisma();
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `INC-WF-${Date.now()}-4`,
        summary: "Workflow Test Ticket 4",
        description: "Testing valid resolution gate path",
        status: "IN_PROGRESS",
        ownerId: staffUser.id,
        requesterId: reqUser.id,
        categoryId,
        systemId,
        version: 1
      }
    });

    // Add a valid completed action with result and addressed follow-up
    await prisma.actionTaken.create({
      data: {
        ticketId: ticket.id,
        performedById: staffUser.id,
        status: "COMPLETED",
        description: "Replaced hardware controller and tested throughput",
        result: "Full link speed verified with zero packet loss",
        followUpRequired: true,
        followUpNote: "Conduct 48-hour monitor log review",
        version: 1
      }
    });

    const res = await request(app)
      .patch(`/api/staff/tickets/${ticket.id}/status`)
      .set("Cookie", staffToken)
      .send({ status: "RESOLVED", expectedVersion: 1 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("RESOLVED");
    expect(res.body.version).toBe(2);

    // Verify DB record
    const updatedTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(updatedTicket?.status).toBe("RESOLVED");
    expect(updatedTicket?.version).toBe(2);
  });

  // API-16: Append-only Ticket Status History audit row created in same transaction
  it("API-16: atomically appends audit entry to TicketStatusHistory upon status transition (HTTP 200)", async () => {
    const prisma = getPrisma();
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `INC-WF-${Date.now()}-5`,
        summary: "Workflow Test Ticket 5",
        description: "Testing audit history transaction",
        status: "OPEN",
        ownerId: staffUser.id,
        requesterId: reqUser.id,
        categoryId,
        systemId,
        version: 1
      }
    });

    const res = await request(app)
      .patch(`/api/staff/tickets/${ticket.id}/status`)
      .set("Cookie", staffToken)
      .send({ status: "IN_PROGRESS", expectedVersion: 1 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("IN_PROGRESS");

    // Fetch history endpoint
    const historyRes = await request(app)
      .get(`/api/tickets/${ticket.id}/history`)
      .set("Cookie", staffToken);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.history.length).toBeGreaterThanOrEqual(1);

    const latest = historyRes.body.history[historyRes.body.history.length - 1];
    expect(latest.fromStatus).toBe("OPEN");
    expect(latest.toStatus).toBe("IN_PROGRESS");
    expect(latest.changedById).toBe(staffUser.id);
  });

  // API-10: Optimistic concurrency collision on ticket status update (expectedVersion mismatch)
  it("API-10: rejects status update on optimistic concurrency mismatch with HTTP 409 Conflict", async () => {
    const prisma = getPrisma();
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `INC-WF-${Date.now()}-6`,
        summary: "Workflow Test Ticket 6",
        description: "Testing status OCC conflict",
        status: "OPEN",
        ownerId: staffUser.id,
        requesterId: reqUser.id,
        categoryId,
        systemId,
        version: 2 // Server version is 2
      }
    });

    // Client sends stale expectedVersion = 1
    const res = await request(app)
      .patch(`/api/staff/tickets/${ticket.id}/status`)
      .set("Cookie", staffToken)
      .send({ status: "IN_PROGRESS", expectedVersion: 1 });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Conflict");
    expect(res.body.message).toMatch(/modified by another user/i);

    // Verify status was NOT modified
    const currentTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(currentTicket?.status).toBe("OPEN");
    expect(currentTicket?.version).toBe(2);
  });

  // API-09: Requester toggles "Problem Appears Resolved" (advisory indicator)
  it("API-09: allows requester to update advisory resolution indicator without changing ticket status", async () => {
    const prisma = getPrisma();
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `INC-WF-${Date.now()}-7`,
        summary: "Workflow Test Ticket 7",
        description: "Testing requester advisory toggle",
        status: "IN_PROGRESS",
        ownerId: staffUser.id,
        requesterId: reqUser.id,
        categoryId,
        systemId,
        problemAppearsResolved: false,
        version: 1
      }
    });

    // 1. Requester sets problemAppearsResolved to true
    const res = await request(app)
      .patch(`/api/tickets/${ticket.id}/resolve-indicator`)
      .set("Cookie", reqToken)
      .send({ problemAppearsResolved: true });

    expect(res.status).toBe(200);
    expect(res.body.problemAppearsResolved).toBe(true);

    // Verify DB: advisory flag is true, but status is STILL IN_PROGRESS!
    const updatedTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(updatedTicket?.problemAppearsResolved).toBe(true);
    expect(updatedTicket?.status).toBe("IN_PROGRESS");

    // 2. Other requester cannot modify this ticket's indicator (403 Forbidden)
    const resForbidden = await request(app)
      .patch(`/api/tickets/${ticket.id}/resolve-indicator`)
      .set("Cookie", otherReqToken)
      .send({ problemAppearsResolved: false });

    expect(resForbidden.status).toBe(403);
  });
});
