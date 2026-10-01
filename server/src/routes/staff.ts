import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";
import { requireStaffOrAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireStaffOrAdmin);

// GET /api/staff/tickets
router.get("/tickets", async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, status, priority, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  try {
    const prisma = getPrisma();
    
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { ticketNumber: { contains: search as string, mode: "insensitive" } },
        { summary: { contains: search as string, mode: "insensitive" } }
      ];
    }
    
    if (status) {
      whereClause.status = status as string;
    }
    
    if (priority) {
      whereClause.itPriority = priority as string;
    }

    const [tickets, totalCount] = await Promise.all([
      prisma.ticket.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: {
          [sortBy as string]: sortOrder === "asc" ? "asc" : "desc"
        },
        include: {
          requester: { select: { id: true, name: true, email: true } },
          owner: { select: { id: true, name: true, email: true } },
          category: true,
          system: true
        }
      }),
      prisma.ticket.count({ where: whereClause })
    ]);

    res.status(200).json({
      data: tickets,
      meta: {
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/staff/tickets/:id
router.get("/tickets/:id", async (req: Request, res: Response) => {
  const ticketId = req.params.id;

  try {
    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: true,
        system: true,
        requester: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        attachments: true
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH /api/staff/tickets/:id/claim
router.patch("/tickets/:id/claim", async (req: Request, res: Response) => {
  const ticketId = req.params.id;
  const userId = res.locals.user.userId;

  try {
    const ticket = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: { ownerId: userId }
    });

    res.status(200).json(ticket);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH /api/staff/tickets/:id/assign
router.patch("/tickets/:id/assign", async (req: Request, res: Response) => {
  const ticketId = req.params.id;
  const { ownerId } = req.body;

  try {
    if (ownerId) {
      const targetUser = await getPrisma().user.findUnique({ where: { id: ownerId } });
      if (!targetUser) {
        return res.status(404).json({ error: "Not Found", message: "User not found" });
      }
      if (!targetUser.isActive) {
        return res.status(400).json({ error: "Bad Request", message: "Cannot assign to an inactive user" });
      }
      if (targetUser.role !== "STAFF" && targetUser.role !== "ADMIN") {
        return res.status(400).json({ error: "Bad Request", message: "Can only assign to STAFF or ADMIN users" });
      }
    }

    const ticket = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: { ownerId: ownerId || null }
    });

    res.status(200).json(ticket);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }
    // Foreign key constraint failed error
    if (error.code === 'P2003') {
      return res.status(400).json({ error: "Bad Request", message: "Invalid owner ID" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH /api/staff/tickets/:id/priority
router.patch("/tickets/:id/priority", async (req: Request, res: Response) => {
  try {
    const { itPriority } = req.body;
    if (!itPriority) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const allowedPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const normalizedPriority = itPriority.toUpperCase();
    if (!allowedPriorities.includes(normalizedPriority)) {
      return res.status(400).json({ error: "Invalid priority value" });
    }

    const ticket = await getPrisma().ticket.update({
      where: { id: req.params.id },
      data: { itPriority: normalizedPriority }
    });

    res.status(200).json(ticket);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH /api/staff/tickets/:id/status
router.patch("/tickets/:id/status", async (req: Request, res: Response) => {
  const ticketId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Bad Request", message: "Missing status" });
  }

  try {
    const normalizedStatus = status.toUpperCase().replace(" ", "_");
    const allowedStatuses = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED"];
    
    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ error: "Bad Request", message: "Invalid status value" });
    }

    const existingTicket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!existingTicket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    const currentStatus = existingTicket.status.toUpperCase().replace(" ", "_");
    
    const transitionMatrix: Record<string, string[]> = {
      NEW: ["OPEN", "IN_PROGRESS", "CANCELLED", "RESOLVED", "CLOSED"],
      OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED", "CLOSED"],
      IN_PROGRESS: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED", "CLOSED", "OPEN"],
      WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED", "CLOSED", "OPEN"],
      RESOLVED: ["CLOSED", "REOPENED"],
      CLOSED: ["REOPENED"],
      REOPENED: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED", "CLOSED"],
      CANCELLED: []
    };

    if (currentStatus !== normalizedStatus && (!transitionMatrix[currentStatus] || !transitionMatrix[currentStatus].includes(normalizedStatus))) {
      return res.status(400).json({ error: "Bad Request", message: "Invalid status transition" });
    }

    const ticket = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: { status: normalizedStatus }
    });

    res.status(200).json(ticket);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
