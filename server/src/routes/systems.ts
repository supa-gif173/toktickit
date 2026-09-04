import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const systems = await getPrisma().relatedSystem.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json(systems);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
