import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";

describe("Staff Ticket Detail API (Sprint 3)", () => {
  let staffToken: string;
  let testTicket: any;
  let staffUser: any;

  beforeAll(async () => {
    const resStaff = await request(app).post("/api/auth/login").send({
      email: "staff1@example.com",
      password: "Password123!"
    });
    staffToken = resStaff.headers["set-cookie"][0].split(";")[0];
    
    staffUser = await getPrisma().user.findUnique({ where: { email: "staff1@example.com" }});
    
    const reqUser = await getPrisma().user.findUnique({ where: { email: "req1@example.com" } });
    const category = await getPrisma().category.findFirst();
    const system = await getPrisma().relatedSystem.findFirst();

    testTicket = await getPrisma().ticket.create({
      data: {
        ticketNumber: "INC-TEST-DETAIL",
        summary: "Test detail summary",
        description: "Test detail description",
        status: "New",
        requesterId: reqUser!.id,
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

  it("API-09: IT Staff claims ticket", async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${testTicket.id}/claim`)
      .set("Cookie", staffToken);

    expect(res.status).toBe(200);
    expect(res.body.ownerId).toBe(staffUser.id);
  });

  it("Assigns ticket to specific user", async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${testTicket.id}/assign`)
      .set("Cookie", staffToken)
      .send({ ownerId: staffUser.id });

    expect(res.status).toBe(200);
    expect(res.body.ownerId).toBe(staffUser.id);
  });

  it("Updates IT priority", async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${testTicket.id}/priority`)
      .set("Cookie", staffToken)
      .send({ itPriority: "High" });

    expect(res.status).toBe(200);
    expect(res.body.itPriority).toBe("High");
  });

  it("Updates ticket status", async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${testTicket.id}/status`)
      .set("Cookie", staffToken)
      .send({ status: "In Progress" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("In Progress");
  });
});
