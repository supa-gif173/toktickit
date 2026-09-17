import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().user.findMany({
      where: { role: "REQUESTER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
    res.status(200).json(requesters);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
