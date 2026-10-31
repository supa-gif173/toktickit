import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";
import bcrypt from "bcrypt";

describe("IT Staff & Admin Dashboard API (Sprint 4 - Issue 5)", () => {
  let staffToken: string;
  let adminToken: string;
  let reqToken: string;
  let staffUser: any;
  let adminUser: any;
  let reqUser: any;
  let categoryId: string;
  let systemId: string;

  beforeAll(async () => {
    const prisma = getPrisma();
    const passwordHash = await bcrypt.hash("Password123!", 10);

    staffUser = await prisma.user.upsert({
      where: { email: "dash-staff@example.com" },
      update: { mustChangePassword: false, isActive: true, role: "STAFF" },
      create: {
        name: "Dashboard Staff",
        email: "dash-staff@example.com",
        passwordHash,
        role: "STAFF",
        isActive: true,
        mustChangePassword: false,
      },
    });

    adminUser = await prisma.user.upsert({
      where: { email: "dash-admin@example.com" },
      update: { mustChangePassword: false, isActive: true, role: "ADMIN" },
      create: {
        name: "Dashboard Admin",
        email: "dash-admin@example.com",
        passwordHash,
        role: "ADMIN",
        isActive: true,
        mustChangePassword: false,
      },
    });

    reqUser = await prisma.user.upsert({
      where: { email: "dash-req-stafftest@example.com" },
      update: { mustChangePassword: false, isActive: true, role: "REQUESTER" },
      create: {
        name: "Dashboard Requester NonStaff",
        email: "dash-req-stafftest@example.com",
        passwordHash,
        role: "REQUESTER",
        isActive: true,
        mustChangePassword: false,
      },
    });

    let cat = await prisma.category.findFirst();
    if (!cat) {
      cat = await prisma.category.create({ data: { name: "Staff Dash Cat" } });
    }
    categoryId = cat.id;

    let sys = await prisma.relatedSystem.findFirst();
    if (!sys) {
      sys = await prisma.relatedSystem.create({ data: { name: "Staff Dash Sys" } });
    }
    systemId = sys.id;

    // Login users
    const staffRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "dash-staff@example.com", password: "Password123!" });
    staffToken = staffRes.headers["set-cookie"][0].split(";")[0].split("=")[1];

    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "dash-admin@example.com", password: "Password123!" });
    adminToken = adminRes.headers["set-cookie"][0].split(";")[0].split("=")[1];

    const reqRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "dash-req-stafftest@example.com", password: "Password123!" });
    reqToken = reqRes.headers["set-cookie"][0].split(";")[0].split("=")[1];
  });

  it("API-12: GET /api/dashboard/staff returns unassigned, assigned-to-me, and breakdowns (AC-11, BR-09)", async () => {
    const res = await request(app)
      .get("/api/dashboard/staff")
      .set("Cookie", [`token=${staffToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("metrics");
    expect(res.body).toHaveProperty("ticketsByPriority");
    expect(res.body).toHaveProperty("recentQueueTickets");

    const { metrics, ticketsByPriority, recentQueueTickets } = res.body;

    expect(typeof metrics.newTickets).toBe("number");
    expect(typeof metrics.openTickets).toBe("number");
    expect(typeof metrics.inProgressTickets).toBe("number");
    expect(typeof metrics.waitingForRequester).toBe("number");
    expect(typeof metrics.myAssignedTickets).toBe("number");
    expect(typeof metrics.unassignedTickets).toBe("number");

    expect(ticketsByPriority).toHaveProperty("URGENT");
    expect(ticketsByPriority).toHaveProperty("HIGH");
    expect(ticketsByPriority).toHaveProperty("MEDIUM");
    expect(ticketsByPriority).toHaveProperty("LOW");

    expect(Array.isArray(recentQueueTickets)).toBe(true);
    if (recentQueueTickets.length > 0) {
      const first = recentQueueTickets[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("ticketNumber");
      expect(first).toHaveProperty("summary");
      expect(first).toHaveProperty("status");
      expect(first).toHaveProperty("itPriority");
    }

    // Since caller is STAFF, adminStats is not attached
    expect(res.body.adminStats).toBeUndefined();
  });

  it("API-12 (Admin): GET /api/dashboard/staff includes adminStats when called by ADMIN (BR-10)", async () => {
    const res = await request(app)
      .get("/api/dashboard/staff")
      .set("Cookie", [`token=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("adminStats");

    const { adminStats } = res.body;
    expect(typeof adminStats.totalUsers).toBe("number");
    expect(typeof adminStats.activeStaff).toBe("number");
    expect(typeof adminStats.activeRequesters).toBe("number");
    expect(adminStats.totalUsers).toBeGreaterThanOrEqual(1);
    expect(adminStats.activeStaff).toBeGreaterThanOrEqual(1);
    expect(adminStats.activeRequesters).toBeGreaterThanOrEqual(1);
  });

  it("API-13: Non-Staff access to Staff dashboard endpoint is rejected with 403 Forbidden (BR-10)", async () => {
    const res = await request(app)
      .get("/api/dashboard/staff")
      .set("Cookie", [`token=${reqToken}`]);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error", "Forbidden");
  });

  it("API-13 (negative): Unauthenticated access to Staff dashboard endpoint is rejected with 401", async () => {
    const res = await request(app).get("/api/dashboard/staff");
    expect(res.status).toBe(401);
  });
});
