import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";

describe("Staff Ticket Detail API (Sprint 3)", () => {
  let staffToken: string;
  let reqToken: string;
  let testTicket: any;
  let staffUser: any;
  let reqUser: any;

  beforeAll(async () => {
    // 1. Staff token
    const resStaff = await request(app).post("/api/auth/login").send({
      email: "staff1@example.com",
      password: "Password123!"
    });
    staffToken = resStaff.headers["set-cookie"][0].split(";")[0];
    staffUser = await getPrisma().user.findUnique({ where: { email: "staff1@example.com" }});
    
    // 2. Requester token
    const resReq = await request(app).post("/api/auth/login").send({
      email: "req1@example.com",
      password: "Password123!"
    });
    reqToken = resReq.headers["set-cookie"][0].split(";")[0];
    reqUser = await getPrisma().user.findUnique({ where: { email: "req1@example.com" } });
    
    // Test data
    const category = await getPrisma().category.findFirst();
    const system = await getPrisma().relatedSystem.findFirst();

    // Reset MUST CHANGE PASSWORD to false so they can pass middleware (the tests for mustChangePassword can force it true temporarily)
    await getPrisma().user.updateMany({
      where: { email: { in: ["staff1@example.com", "req1@example.com"] } },
      data: { mustChangePassword: false, isActive: true }
    });

    testTicket = await getPrisma().ticket.create({
      data: {
        ticketNumber: "INC-DETAIL-999",
        summary: "Test detail summary",
        description: "Test detail description",
        status: "NEW", // Valid initial status
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

  it("Updates IT priority to valid value", async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${testTicket.id}/priority`)
      .set("Cookie", staffToken)
      .send({ itPriority: "HIGH" });

    expect(res.status).toBe(200);
    expect(res.body.itPriority).toBe("HIGH");
  });

  it("Updates ticket status to valid transition", async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${testTicket.id}/status`)
      .set("Cookie", staffToken)
      .send({ status: "IN_PROGRESS" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("IN_PROGRESS");
  });

  // NEGATIVE TESTS

  it("Fails to update ticket status with invalid transition (e.g. IN_PROGRESS to NEW)", async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${testTicket.id}/status`)
      .set("Cookie", staffToken)
      .send({ status: "NEW" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Bad Request");
  });

  it("Fails to update priority to invalid value", async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${testTicket.id}/priority`)
      .set("Cookie", staffToken)
      .send({ itPriority: "EXTREME" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid priority value");
  });

  it("Fails to assign ticket to a Requester", async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${testTicket.id}/assign`)
      .set("Cookie", staffToken)
      .send({ ownerId: reqUser.id });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Can only assign to STAFF or ADMIN users");
  });

  it("Fails to assign ticket to an inactive user", async () => {
    // temporarily make reqUser inactive (though it's already rejected due to role, let's make staff inactive)
    const inactiveStaff = await getPrisma().user.findUnique({ where: { email: "inactive_staff@example.com" } });
    if (!inactiveStaff) {
      // create one if not seeded properly for this test
      await getPrisma().user.create({
        data: {
          email: "inactive_staff_test@example.com",
          name: "Inactive",
          passwordHash: "hash",
          role: "STAFF",
          isActive: false
        }
      });
    }
    const targetId = inactiveStaff?.id || (await getPrisma().user.findUnique({ where: { email: "inactive_staff_test@example.com" } }))?.id;

    const res = await request(app)
      .patch(`/api/staff/tickets/${testTicket.id}/assign`)
      .set("Cookie", staffToken)
      .send({ ownerId: targetId });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Cannot assign to an inactive user");

    // Cleanup
    await getPrisma().user.delete({ where: { email: "inactive_staff_test@example.com" } }).catch(() => {});
  });

  it("Rejects request with 403 when user must change password", async () => {
    // Temporarily set mustChangePassword = true for staff
    await getPrisma().user.update({
      where: { id: staffUser.id },
      data: { mustChangePassword: true }
    });

    const res = await request(app)
      .patch(`/api/staff/tickets/${testTicket.id}/priority`)
      .set("Cookie", staffToken)
      .send({ itPriority: "LOW" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Password change required");

    // Revert
    await getPrisma().user.update({
      where: { id: staffUser.id },
      data: { mustChangePassword: false }
    });
  });

});
