import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPrisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await getPrisma().user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is inactive" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, mustChangePassword: user.mustChangePassword },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        requiresPasswordChange: user.mustChangePassword
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await getPrisma().user.findUnique({
      where: { id: res.locals.user.userId }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        requiresPasswordChange: user.mustChangePassword
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/change-password", requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = res.locals.user.userId;

    const user = await getPrisma().user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await getPrisma().user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false
      }
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
