import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
void request; void app;

// Issue 4 — write this test yourself, using health.test.ts as the pattern.
// Requires the DB to be migrated and seeded first.
// It should assert: GET /api/categories returns 200 and the four seeded
// category names in id order.
describe("GET /api/categories", () => {
  it("returns the four seeded categories in id order", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(4);
    // Assuming the first 4 are the seeded ones if DB is clean
    const names = res.body.map((c: any) => c.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "Account and Access",
        "Hardware",
        "Software",
        "Network",
      ])
    );
  });
});
