import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";
import bcrypt from "bcrypt";

describe("Requester Dashboard API (Sprint 4 - Issue 5)", () => {
  let reqToken: string;
  let otherReqToken: string;
  let reqUser: any;
  let otherReqUser: any;
  let categoryId: string;
  let systemId: string;

  beforeAll(async () => {
    const prisma = getPrisma();
    const passwordHash = await bcrypt.hash("Password123!", 10);

    reqUser = await prisma.user.upsert({
      where: { email: "dash-req1@example.com" },
      update: { mustChangePassword: false, isActive: true, role: "REQUESTER" },
      create: {
        name: "Dashboard Requester 1",
        email: "dash-req1@example.com",
        passwordHash,
        role: "REQUESTER",
        isActive: true,
        mustChangePassword: false,
      },
    });

    otherReqUser = await prisma.user.upsert({
      where: { email: "dash-req2@example.com" },
      update: { mustChangePassword: false, isActive: true, role: "REQUESTER" },
      create: {
        name: "Dashboard Requester 2",
        email: "dash-req2@example.com",
        passwordHash,
        role: "REQUESTER",
        isActive: true,
        mustChangePassword: false,
      },
    });

    let cat = await prisma.category.findFirst();
    if (!cat) {
      cat = await prisma.category.create({ data: { name: "Dashboard Test Cat" } });
    }
    categoryId = cat.id;

    let sys = await prisma.relatedSystem.findFirst();
    if (!sys) {
      sys = await prisma.relatedSystem.create({ data: { name: "Dashboard Test Sys" } });
    }
    systemId = sys.id;

    // Login reqUser
    const reqRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "dash-req1@example.com", password: "Password123!" });
    reqToken = reqRes.headers["set-cookie"][0].split(";")[0].split("=")[1];

    // Login otherReqUser
    const otherRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "dash-req2@example.com", password: "Password123!" });
    otherReqToken = otherRes.headers["set-cookie"][0].split(";")[0].split("=")[1];

    // Clean up any old tickets for reqUser
    await prisma.ticket.deleteMany({
      where: { requesterId: reqUser.id },
    });

    // Create known ticket set for reqUser:
    // 1. OPEN ticket
    await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-DASH-${Date.now()}-1`,
        summary: "Req1 Open Ticket",
        description: "Open ticket description",
        status: "OPEN",
        requesterId: reqUser.id,
        categoryId,
        systemId,
        itPriority: "HIGH",
      },
    });

    // 2. WAITING_FOR_REQUESTER ticket (also counts towards myOpenTickets)
    await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-DASH-${Date.now()}-2`,
        summary: "Req1 Waiting Ticket",
        description: "Waiting ticket description",
        status: "WAITING_FOR_REQUESTER",
        requesterId: reqUser.id,
        categoryId,
        systemId,
        itPriority: "MEDIUM",
      },
    });

    // 3. RESOLVED ticket
    await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-DASH-${Date.now()}-3`,
        summary: "Req1 Resolved Ticket",
        description: "Resolved ticket description",
        status: "RESOLVED",
        requesterId: reqUser.id,
        categoryId,
        systemId,
        itPriority: "LOW",
      },
    });

    // 4. CANCELLED ticket (should NOT count in myOpenTickets or recentlyResolved)
    await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-DASH-${Date.now()}-4`,
        summary: "Req1 Cancelled Ticket",
        description: "Cancelled ticket description",
        status: "CANCELLED",
        requesterId: reqUser.id,
        categoryId,
        systemId,
        itPriority: "LOW",
      },
    });

    // Create 1 ticket for otherReqUser to test isolation
    await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-DASH-${Date.now()}-5`,
        summary: "Other Requester Ticket",
        description: "Other user ticket",
        status: "OPEN",
        requesterId: otherReqUser.id,
        categoryId,
        systemId,
        itPriority: "HIGH",
      },
    });
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.ticket.deleteMany({
      where: { requesterId: { in: [reqUser.id, otherReqUser.id] } },
    });
  });

  it("API-11: GET /api/dashboard/requester returns accurate personal metrics and recent tickets (AC-10, BR-08)", async () => {
    const res = await request(app)
      .get("/api/dashboard/requester")
      .set("Cookie", [`token=${reqToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("metrics");
    expect(res.body).toHaveProperty("recentTickets");

    const { metrics, recentTickets } = res.body;

    // Open tickets for reqUser: OPEN (1) + WAITING_FOR_REQUESTER (1) = 2
    expect(metrics.myOpenTickets).toBe(2);
    // Waiting for requester: 1
    expect(metrics.waitingForRequester).toBe(1);
    // Recently resolved: 1
    expect(metrics.recentlyResolved).toBe(1);

    // Recent tickets array should contain at most 4 tickets belonging to reqUser
    expect(recentTickets.length).toBe(4);
    for (const t of recentTickets) {
      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("ticketNumber");
      expect(t).toHaveProperty("summary");
      expect(t).toHaveProperty("status");
      expect(t).toHaveProperty("itPriority");
      expect(t).toHaveProperty("version");
      expect(t).toHaveProperty("updatedAt");
    }
  });

  it("API-11 (negative): GET /api/dashboard/requester rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/dashboard/requester");
    expect(res.status).toBe(401);
  });
});
