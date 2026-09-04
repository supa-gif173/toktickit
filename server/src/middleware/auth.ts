import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../prisma.js";

export const mockAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const requesterId = req.header("X-Requester-Id");

  if (!requesterId) {
    return res.status(401).json({ error: "Unauthorized", message: "Missing X-Requester-Id header" });
  }

  try {
    const user = await getPrisma().requesterUser.findUnique({
      where: { id: requesterId }
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid X-Requester-Id" });
    }

    res.locals.requesterId = requesterId;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
