import express, { Request, Response } from "express";
import cors from "cors";
import requestersRouter from "./routes/requesters.js";
import systemsRouter from "./routes/systems.js";
import categoriesRouter from "./routes/categories.js";
import ticketsRouter from "./routes/tickets.js";
import attachmentsRouter from "./routes/attachments.js";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import { getPrisma } from "./prisma.js";
// getPrisma() is your lazy database handle. Call it INSIDE a route when you
// need the DB (Issue 4). It is intentionally unused until then.
void getPrisma;

// The Express app is exported separately from app.listen() (see index.ts) so
// Supertest can import `app` without opening a port. Do not merge these files.
export const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true })); // lets the Vite dev server call this API
app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Issue 2 — API health check
// Make the test in tests/lab-01/health.test.ts pass.
// It must return HTTP 200 with JSON: { status: "ok", service: "TokTickIT API" }
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// ---------------------------------------------------------------------------
// Modular API Routes
// ---------------------------------------------------------------------------
app.use("/api/auth", authRouter);
app.use("/api/requesters", requestersRouter);
app.use("/api/systems", systemsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/attachments", attachmentsRouter);
// ---------------------------------------------------------------------------

export default app;
