import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";

describe("Requester Tickets API (Sprint 3)", () => {
  let requesterToken: string;
  let categoryId: string;
  let systemId: string;
  let createdTicketId: string;

  beforeAll(async () => {
    // Assume db is seeded with req1@example.com
    const resReq = await request(app).post("/api/auth/login").send({
      email: "req1@example.com",
      password: "Password123!"
    });
    requesterToken = resReq.headers["set-cookie"][0].split(";")[0];

    const category = await getPrisma().category.findFirst();
    const system = await getPrisma().relatedSystem.findFirst();
    if (!category || !system) throw new Error("Missing seeded category/system");

    categoryId = category.id;
    systemId = system.id;
  });

  afterAll(async () => {
    if (createdTicketId) {
      await getPrisma().ticket.delete({ where: { id: createdTicketId } }).catch(() => {});
    }
    await getPrisma().$disconnect();
  });

  it("Verifies that tickets created via Requester flow are saved with uppercase NEW and LOW priority", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("Cookie", requesterToken)
      .send({
        summary: "Test uppercase",
        description: "Testing uppercase defaults",
        categoryId,
        systemId
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("NEW");
    expect(res.body.requestedPriority).toBe("LOW");
    expect(res.body.itPriority).toBe("LOW");

    createdTicketId = res.body.id;

    // Verify in DB directly as well
    const dbTicket = await getPrisma().ticket.findUnique({ where: { id: createdTicketId } });
    expect(dbTicket?.status).toBe("NEW");
    expect(dbTicket?.requestedPriority).toBe("LOW");
    expect(dbTicket?.itPriority).toBe("LOW");
  });
});
