import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getPrisma } from "../prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized", message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await getPrisma().user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
      return res.status(403).json({ error: "Forbidden", message: "Account is inactive" });
    }

    if (user.mustChangePassword && req.originalUrl !== "/api/auth/change-password" && req.originalUrl !== "/api/auth/logout") {
      return res.status(403).json({ error: "Forbidden", message: "Password change required" });
    }

    res.locals.user = { userId: user.id, role: user.role, mustChangePassword: user.mustChangePassword };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
  }
};

export const requireStaffOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    const role = res.locals.user?.role;
    if (role !== "STAFF" && role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden", message: "Requires STAFF or ADMIN role" });
    }
    next();
  });
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    const role = res.locals.user?.role;
    if (role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden", message: "Requires ADMIN role" });
    }
    next();
  });
};
