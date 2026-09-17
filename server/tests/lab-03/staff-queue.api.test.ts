import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";

describe("Staff Queue API (Sprint 3)", () => {
  let staffToken: string;
  let requesterToken: string;
  let testTicket: any;

  beforeAll(async () => {
    // We assume the db is seeded with staff1@example.com and req1@example.com
    const resStaff = await request(app).post("/api/auth/login").send({
      email: "staff1@example.com",
      password: "Password123!"
    });
    staffToken = resStaff.headers["set-cookie"][0].split(";")[0];

    const resReq = await request(app).post("/api/auth/login").send({
      email: "req1@example.com",
      password: "Password123!"
    });
    requesterToken = resReq.headers["set-cookie"][0].split(";")[0];

    const reqUser = await getPrisma().user.findUnique({ where: { email: "req1@example.com" } });
    const category = await getPrisma().category.findFirst();
    const system = await getPrisma().relatedSystem.findFirst();

    if (!category || !system || !reqUser) throw new Error("Missing seeded data");

    testTicket = await getPrisma().ticket.create({
      data: {
        ticketNumber: "INC-TEST",
        summary: "Test summary",
        description: "Test description",
        status: "New",
        requesterId: reqUser.id,
        categoryId: category.id,
        systemId: system.id
      }
    });
  });

  afterAll(async () => {
    if (testTicket) {
      await getPrisma().ticket.delete({ where: { id: testTicket.id } }).catch(() => {});
    }
    await getPrisma().$disconnect();
  });

  it("API-06: IT Staff accesses Queue - Returns 200 and tickets", async () => {
    const res = await request(app)
      .get("/api/staff/tickets")
      .set("Cookie", staffToken);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.meta).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("API-07: IT Staff Queue search - Returns filtered matching tickets", async () => {
    // Assuming a seeded ticket has some summary text
    const searchString = testTicket.ticketNumber;
    const res = await request(app)
      .get(`/api/staff/tickets?search=${searchString}`)
      .set("Cookie", staffToken);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].ticketNumber).toBe(searchString);
  });

  it("Rejects access for Requester (403)", async () => {
    const res = await request(app)
      .get("/api/staff/tickets")
      .set("Cookie", requesterToken);

    expect(res.status).toBe(403);
  });
});
