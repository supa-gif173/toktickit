import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized", message: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.locals.user = decoded;
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
