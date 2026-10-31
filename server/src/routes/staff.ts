import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";
import { requireStaffOrAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireStaffOrAdmin);

// GET /api/staff/assignees
router.get("/assignees", async (_req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const assignees = await prisma.user.findMany({
      where: {
        role: { in: ["STAFF", "ADMIN"] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      },
      orderBy: { name: "asc" }
    });

    res.status(200).json(assignees);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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
        attachments: true,
        actionsTaken: {
          include: {
            performedBy: { select: { id: true, name: true, email: true, role: true } },
            assignee: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { actionDateTime: "asc" }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    res.status(200).json({ ...ticket, ticket, message: "Ticket status updated successfully" });
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

    res.status(200).json({ ...ticket, ticket, message: "Ticket status updated successfully" });
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

    res.status(200).json({ ...ticket, ticket, message: "Ticket status updated successfully" });
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

    res.status(200).json({ ...ticket, ticket, message: "Ticket status updated successfully" });
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
  const { status, expectedVersion } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Bad Request", message: "Missing status" });
  }

  try {
    const prisma = getPrisma();
    const normalizedStatus = status.toUpperCase().replace(" ", "_");
    const allowedStatuses = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED"];
    
    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ error: "Bad Request", message: "Invalid status value" });
    }

    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existingTicket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    // Concurrency check if expectedVersion is supplied
    if (expectedVersion !== undefined && existingTicket.version !== Number(expectedVersion)) {
      return res.status(409).json({ error: "Conflict", message: "Ticket has been modified by another user." });
    }

    const currentStatus = existingTicket.status.toUpperCase().replace(" ", "_");
    
    const transitionMatrix: Record<string, string[]> = {
      NEW: ["OPEN", "IN_PROGRESS", "CANCELLED"],
      OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
      IN_PROGRESS: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED", "OPEN"],
      WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
      RESOLVED: ["CLOSED", "REOPENED"],
      CLOSED: ["REOPENED"],
      REOPENED: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
      CANCELLED: []
    };

    if (currentStatus !== normalizedStatus && (!transitionMatrix[currentStatus] || !transitionMatrix[currentStatus].includes(normalizedStatus))) {
      return res.status(400).json({ error: "Bad Request", message: "Invalid status transition" });
    }

    // Resolution Gate Enforcement (BR-06)
    if (normalizedStatus === "RESOLVED") {
      if (!existingTicket.ownerId) {
        return res.status(400).json({
          code: "RESOLUTION_GATE_FAILED",
          error: "Bad Request",
          message: "Resolution Gate: Ticket must be assigned to an IT Staff owner before resolving."
        });
      }

      const actions = await prisma.actionTaken.findMany({
        where: { ticketId }
      });

      if (actions.length === 0) {
        return res.status(400).json({
          code: "RESOLUTION_GATE_FAILED",
          error: "Bad Request",
          message: "Resolution Gate: Ticket cannot be marked as RESOLVED without at least one completed Action Taken with an outcome result."
        });
      }

      const completedActionsWithResult = actions.filter(
        (a) => a.status === "COMPLETED" && a.result && a.result.trim().length > 0
      );
      if (completedActionsWithResult.length === 0) {
        return res.status(400).json({
          code: "RESOLUTION_GATE_FAILED",
          error: "Bad Request",
          message: "Resolution Gate: Ticket cannot be marked as RESOLVED without at least one completed Action Taken with an outcome result."
        });
      }

      const unaddressedFollowUps = actions.filter(
        (a) => a.followUpRequired && (!a.followUpNote || a.followUpNote.trim().length === 0)
      );
      if (unaddressedFollowUps.length > 0) {
        return res.status(400).json({
          code: "RESOLUTION_GATE_FAILED",
          error: "Bad Request",
          message: "Resolution Gate: All actions requiring follow-up must have documented follow-up notes."
        });
      }
    }

    const ticket = await prisma.$transaction(async (tx) => {
      let updatedTicket;
      if (expectedVersion !== undefined) {
        const updateResult = await tx.ticket.updateMany({
          where: { id: ticketId, version: Number(expectedVersion) },
          data: {
            status: normalizedStatus,
            version: Number(expectedVersion) + 1
          }
        });
        if (updateResult.count === 0) {
          throw new Error("CONCURRENCY_CONFLICT");
        }
        updatedTicket = await tx.ticket.findUnique({ where: { id: ticketId } });
      } else {
        updatedTicket = await tx.ticket.update({
          where: { id: ticketId },
          data: {
            status: normalizedStatus,
            version: existingTicket.version + 1
          }
        });
      }

      // Append to TicketStatusHistory if status changed
      if (currentStatus !== normalizedStatus) {
        await tx.ticketStatusHistory.create({
          data: {
            ticketId,
            fromStatus: currentStatus,
            toStatus: normalizedStatus,
            changedById: res.locals.user.userId
          }
        });
      }

      return updatedTicket;
    });

    res.status(200).json({ ...ticket, ticket, message: "Ticket status updated successfully" });
  } catch (error: any) {
    if (error.message === "CONCURRENCY_CONFLICT") {
      return res.status(409).json({ error: "Conflict", message: "Ticket has been modified by another user." });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
