import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import bcrypt from "bcrypt";

const router = Router();
router.use(requireAdmin);

router.get("/users", async (req: Request, res: Response) => {
  const { search, role } = req.query;

  try {
    const prisma = getPrisma();
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } }
      ];
    }
    if (role) {
      whereClause.role = role as string;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      }
    });

    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/users", async (req: Request, res: Response) => {
  const { name, email, role, isActive, password } = req.body;

  if (!name || !email || !role || !password) {
    return res.status(400).json({ error: "Bad Request", message: "Missing required fields" });
  }

  try {
    const prisma = getPrisma();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Conflict", message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        isActive: isActive !== undefined ? isActive : true,
        mustChangePassword: true,
        passwordHash
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, mustChangePassword: true, createdAt: true }
    });

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = res.locals.user.userId;
  const { name, email, role, isActive, password } = req.body;

  try {
    const prisma = getPrisma();

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: "Not Found", message: "User not found" });
    }

    // Safety rules
    if (isActive === false && id === adminId) {
      return res.status(400).json({ error: "Bad Request", message: "Cannot deactivate own account" });
    }

    if ((isActive === false || (role && role !== "ADMIN")) && targetUser.role === "ADMIN" && targetUser.isActive) {
      const activeAdmins = await prisma.user.count({
        where: { role: "ADMIN", isActive: true }
      });
      if (activeAdmins <= 1) {
        return res.status(400).json({ error: "Bad Request", message: "Cannot deactivate or remove role from the last active Admin" });
      }
    }

    if (email && email !== targetUser.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ error: "Conflict", message: "Email already exists" });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
      updateData.mustChangePassword = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true, mustChangePassword: true, createdAt: true }
    });

    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
