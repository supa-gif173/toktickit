import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";

describe("Authorization API (Sprint 3)", () => {
  let req1Token: string;
  let req2Token: string;
  let req1User: any;
  let req2User: any;
  let req1Ticket: any;
  let categoryId: string;
  let systemId: string;

  beforeAll(async () => {
    // Ensure mustChangePassword is false for test users
    await getPrisma().user.updateMany({
      where: { email: { in: ["req1@example.com", "req2@example.com"] } },
      data: { mustChangePassword: false, isActive: true }
    });

    // 1. Log in as req1
    const res1 = await request(app).post("/api/auth/login").send({
      email: "req1@example.com",
      password: "Password123!"
    });
    req1Token = res1.headers["set-cookie"][0].split(";")[0];
    req1User = await getPrisma().user.findUnique({ where: { email: "req1@example.com" } });

    // 2. Log in as req2
    const res2 = await request(app).post("/api/auth/login").send({
      email: "req2@example.com",
      password: "Password123!"
    });
    req2Token = res2.headers["set-cookie"][0].split(";")[0];
    req2User = await getPrisma().user.findUnique({ where: { email: "req2@example.com" } });

    const category = await getPrisma().category.findFirst();
    const system = await getPrisma().relatedSystem.findFirst();
    categoryId = category!.id;
    systemId = system!.id;

    // Create a ticket owned by req1
    req1Ticket = await getPrisma().ticket.create({
      data: {
        ticketNumber: "INC-AUTH-001",
        summary: "Req1 Private Ticket",
        description: "Confidential ticket details",
        status: "NEW",
        requesterId: req1User.id,
        categoryId,
        systemId
      }
    });
  });

  afterAll(async () => {
    if (req1Ticket) {
      await getPrisma().ticket.delete({ where: { id: req1Ticket.id } }).catch(() => {});
    }
    await getPrisma().$disconnect();
  });

  it("API-04 / AC-03: Requester accesses own ticket -> 200 OK", async () => {
    const res = await request(app)
      .get(`/api/tickets/${req1Ticket.id}`)
      .set("Cookie", req1Token);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(req1Ticket.id);
    expect(res.body.summary).toBe("Req1 Private Ticket");
    expect(res.body.requesterId).toBe(req1User.id);
  });

  it("API-05 / AC-03: Requester accesses other ticket -> 403 Forbidden; No data leaked", async () => {
    const res = await request(app)
      .get(`/api/tickets/${req1Ticket.id}`)
      .set("Cookie", req2Token);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
    // Ensure no ticket content is leaked
    expect(res.body.summary).toBeUndefined();
    expect(res.body.description).toBeUndefined();
  });

  it("BR-03: The authenticated user identity, not client requesterId, determines ownership", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("Cookie", req1Token)
      .send({
        summary: "Ticket with spoofed requesterId",
        description: "Attempting to spoof requesterId as req2",
        categoryId,
        systemId,
        requesterId: req2User.id // Spoofed client input
      });

    expect(res.status).toBe(201);
    // Must be assigned to authenticated user (req1), not spoofed req2
    expect(res.body.requesterId).toBe(req1User.id);

    // Clean up created ticket
    await getPrisma().ticket.delete({ where: { id: res.body.id } }).catch(() => {});
  });

  it("Unauthenticated request to ticket endpoint returns 401 Unauthorized", async () => {
    const res = await request(app).get(`/api/tickets/${req1Ticket.id}`);
    expect(res.status).toBe(401);
  });
});
