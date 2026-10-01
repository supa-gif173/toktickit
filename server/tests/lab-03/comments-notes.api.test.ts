import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";

describe("Comments & Notes API (Sprint 3)", () => {
  let req1Token: string;
  let req2Token: string;
  let staffToken: string;
  let adminToken: string;
  let req1User: any;
  let staffUser: any;
  let testTicket: any;

  beforeAll(async () => {
    await getPrisma().user.updateMany({
      where: { email: { in: ["req1@example.com", "req2@example.com", "staff1@example.com", "admin1@example.com"] } },
      data: { mustChangePassword: false, isActive: true }
    });

    // 1. Log in as req1
    const resReq1 = await request(app).post("/api/auth/login").send({
      email: "req1@example.com",
      password: "Password123!"
    });
    req1Token = resReq1.headers["set-cookie"][0].split(";")[0];
    req1User = await getPrisma().user.findUnique({ where: { email: "req1@example.com" } });

    // 2. Log in as req2
    const resReq2 = await request(app).post("/api/auth/login").send({
      email: "req2@example.com",
      password: "Password123!"
    });
    req2Token = resReq2.headers["set-cookie"][0].split(";")[0];

    // 3. Log in as staff
    const resStaff = await request(app).post("/api/auth/login").send({
      email: "staff1@example.com",
      password: "Password123!"
    });
    staffToken = resStaff.headers["set-cookie"][0].split(";")[0];
    staffUser = await getPrisma().user.findUnique({ where: { email: "staff1@example.com" } });

    // 4. Log in as admin
    const resAdmin = await request(app).post("/api/auth/login").send({
      email: "admin1@example.com",
      password: "Password123!"
    });
    adminToken = resAdmin.headers["set-cookie"][0].split(";")[0];

    const category = await getPrisma().category.findFirst();
    const system = await getPrisma().relatedSystem.findFirst();

    testTicket = await getPrisma().ticket.create({
      data: {
        ticketNumber: "INC-COMM-001",
        summary: "Comments & Notes Test Ticket",
        description: "Testing public comments and internal notes separation",
        status: "OPEN",
        requesterId: req1User.id,
        categoryId: category!.id,
        systemId: system!.id
      }
    });
  });

  afterAll(async () => {
    if (testTicket) {
      await getPrisma().ticket.delete({ where: { id: testTicket.id } }).catch(() => {});
    }
    await getPrisma().$disconnect();
  });

  it("API-08 / AC-04: Requester requests Internal Notes -> 403 Forbidden; no note data returned", async () => {
    const res = await request(app)
      .get(`/api/tickets/${testTicket.id}/notes`)
      .set("Cookie", req1Token);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
    expect(res.body.message).toContain("Internal notes are restricted");
  });

  it("Requester attempting to post an Internal Note is rejected with 403 Forbidden", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicket.id}/notes`)
      .set("Cookie", req1Token)
      .send({ content: "Secret requester note" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  it("IT Staff can create and retrieve Internal Notes", async () => {
    const postRes = await request(app)
      .post(`/api/tickets/${testTicket.id}/notes`)
      .set("Cookie", staffToken)
      .send({ content: "Investigating server crash logs privately." });

    expect(postRes.status).toBe(201);
    expect(postRes.body.content).toBe("Investigating server crash logs privately.");
    expect(postRes.body.author.role).toBe("STAFF");

    const getRes = await request(app)
      .get(`/api/tickets/${testTicket.id}/notes`)
      .set("Cookie", staffToken);

    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBeGreaterThanOrEqual(1);
    expect(getRes.body[0].content).toBe("Investigating server crash logs privately.");
  });

  it("Administrator can also retrieve Internal Notes", async () => {
    const res = await request(app)
      .get(`/api/tickets/${testTicket.id}/notes`)
      .set("Cookie", adminToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("Requester can post and view Public Comments on own ticket", async () => {
    const postRes = await request(app)
      .post(`/api/tickets/${testTicket.id}/comments`)
      .set("Cookie", req1Token)
      .send({ content: "Thank you for looking into this issue." });

    expect(postRes.status).toBe(201);
    expect(postRes.body.content).toBe("Thank you for looking into this issue.");
    expect(postRes.body.author.id).toBe(req1User.id);

    const getRes = await request(app)
      .get(`/api/tickets/${testTicket.id}/comments`)
      .set("Cookie", req1Token);

    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.some((c: any) => c.content === "Thank you for looking into this issue.")).toBe(true);
  });

  it("Non-owner Requester cannot view or post comments on another user's ticket", async () => {
    const getRes = await request(app)
      .get(`/api/tickets/${testTicket.id}/comments`)
      .set("Cookie", req2Token);
    expect(getRes.status).toBe(403);

    const postRes = await request(app)
      .post(`/api/tickets/${testTicket.id}/comments`)
      .set("Cookie", req2Token)
      .send({ content: "Malicious requester comment" });
    expect(postRes.status).toBe(403);
  });

  it("Rejects empty or whitespace-only comments/notes with 400 Bad Request", async () => {
    const resComment = await request(app)
      .post(`/api/tickets/${testTicket.id}/comments`)
      .set("Cookie", req1Token)
      .send({ content: "   " });
    expect(resComment.status).toBe(400);

    const resNote = await request(app)
      .post(`/api/tickets/${testTicket.id}/notes`)
      .set("Cookie", staffToken)
      .send({ content: "" });
    expect(resNote.status).toBe(400);
  });
});
