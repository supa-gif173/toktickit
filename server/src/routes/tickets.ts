import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.post("/", async (req: Request, res: Response) => {
  const requesterId = res.locals.user.userId;
  const { summary, description, categoryId, systemId, attachments } = req.body;

  if (!summary || !description || !categoryId || !systemId) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Validation failed",
      details: ["'summary', 'description', 'categoryId', and 'systemId' are required."]
    });
  }

  try {
    const prisma = getPrisma();
    
    // Auto-generate ticketNumber, simple strategy
    const count = await prisma.ticket.count();
    const ticketNumber = `INC-${10001 + count}`;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        summary,
        description,
        status: "NEW",
        requesterId,
        categoryId,
        systemId,
        attachments: attachments && attachments.length > 0 ? {
          connect: attachments.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        attachments: true
      }
    });

    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  const requesterId = res.locals.user.userId;
  const { page = 1, limit = 10, search, status, category, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  try {
    const prisma = getPrisma();
    
    const whereClause: any = {
      requesterId
    };

    if (search) {
      whereClause.summary = { contains: search as string, mode: "insensitive" };
    }
    if (status) {
      whereClause.status = status as string;
    }
    if (category) {
      whereClause.categoryId = category as string;
    }

    const [tickets, totalCount] = await Promise.all([
      prisma.ticket.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: {
          [sortBy as string]: sortOrder === "asc" ? "asc" : "desc"
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

router.get("/:id", async (req: Request, res: Response) => {
  const requesterId = res.locals.user.userId;
  const ticketId = req.params.id;

  try {
    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: true,
        system: true,
        requester: true,
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

    if (res.locals.user.role === "REQUESTER" && ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Forbidden", message: "You do not own this ticket" });
    }

    res.status(200).json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/tickets/:id/comments
router.get("/:id/comments", async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
  const userRole = res.locals.user.role;
  const ticketId = req.params.id;

  try {
    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    if (userRole === "REQUESTER" && ticket.requesterId !== userId) {
      return res.status(403).json({ error: "Forbidden", message: "You do not own this ticket" });
    }

    const comments = await getPrisma().comment.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    res.status(200).json(comments);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/tickets/:id/comments
router.post("/:id/comments", async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
  const userRole = res.locals.user.role;
  const ticketId = req.params.id;
  const { content } = req.body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ error: "Bad Request", message: "Comment content cannot be empty" });
  }

  if (content.length > 2000) {
    return res.status(400).json({ error: "Bad Request", message: "Comment content exceeds limit of 2000 characters" });
  }

  try {
    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    if (userRole === "REQUESTER" && ticket.requesterId !== userId) {
      return res.status(403).json({ error: "Forbidden", message: "You do not own this ticket" });
    }

    const comment = await getPrisma().comment.create({
      data: {
        ticketId,
        authorId: userId,
        content: content.trim()
      },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/tickets/:id/notes
router.get("/:id/notes", async (req: Request, res: Response) => {
  const userRole = res.locals.user.role;
  const ticketId = req.params.id;

  if (userRole !== "STAFF" && userRole !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden", message: "Internal notes are restricted to IT Staff and Administrators" });
  }

  try {
    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    const notes = await getPrisma().internalNote.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    res.status(200).json(notes);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/tickets/:id/notes
router.post("/:id/notes", async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
  const userRole = res.locals.user.role;
  const ticketId = req.params.id;
  const { content } = req.body;

  if (userRole !== "STAFF" && userRole !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden", message: "Internal notes are restricted to IT Staff and Administrators" });
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ error: "Bad Request", message: "Note content cannot be empty" });
  }

  if (content.length > 2000) {
    return res.status(400).json({ error: "Bad Request", message: "Note content exceeds limit of 2000 characters" });
  }

  try {
    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    const note = await getPrisma().internalNote.create({
      data: {
        ticketId,
        authorId: userId,
        content: content.trim()
      },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    res.status(201).json(note);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ===========================================================================
// Sprint 4 — Actions Taken & Ticket Status History
// ===========================================================================

// GET /api/tickets/:id/actions
router.get("/:id/actions", async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
  const userRole = res.locals.user.role;
  const ticketId = req.params.id;

  try {
    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    if (userRole === "REQUESTER" && ticket.requesterId !== userId) {
      return res.status(403).json({ error: "Forbidden", message: "You do not own this ticket" });
    }

    const actions = await getPrisma().actionTaken.findMany({
      where: { ticketId },
      orderBy: { actionDateTime: "asc" },
      include: {
        performedBy: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    res.status(200).json({ actions });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// POST /api/tickets/:id/actions
router.post("/:id/actions", async (req: Request, res: Response) => {
  const userRole = res.locals.user.role;
  const userId = res.locals.user.userId;
  const ticketId = req.params.id;

  if (userRole !== "STAFF" && userRole !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden", message: "Actions Taken creation is restricted to IT Staff and Administrators" });
  }

  const { description, result, assigneeId, status, actionDateTime, followUpRequired, followUpNote, attachmentNotes } = req.body;

  if (!description || typeof description !== "string" || description.trim().length === 0) {
    return res.status(400).json({ error: "Bad Request", message: "Action description is required (1-2000 characters)" });
  }
  if (description.length > 2000) {
    return res.status(400).json({ error: "Bad Request", message: "Action description exceeds limit of 2000 characters" });
  }

  // Validate actionDateTime: cannot be invalid or in the future (BR-03)
  if (actionDateTime) {
    const dt = new Date(actionDateTime);
    if (isNaN(dt.getTime())) {
      return res.status(400).json({ error: "Bad Request", message: "Invalid action date/time" });
    }
    if (dt.getTime() > Date.now() + 60000) {
      return res.status(400).json({ error: "Bad Request", message: "Action date/time cannot be in the future" });
    }
  }

  const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
  const actionStatus = status ? status.toUpperCase() : "PENDING";
  if (!validStatuses.includes(actionStatus)) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid action status value" });
  }

  if (actionStatus === "COMPLETED") {
    if (!result || typeof result !== "string" || result.trim().length === 0) {
      return res.status(400).json({ error: "Bad Request", message: "Result is required when action is marked as COMPLETED" });
    }
  }

  if (followUpRequired) {
    if (!followUpNote || typeof followUpNote !== "string" || followUpNote.trim().length === 0) {
      return res.status(400).json({ error: "Bad Request", message: "Follow-up note is required when follow-up is required." });
    }
  }

  try {
    const prisma = getPrisma();
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    if (assigneeId) {
      const assigneeUser = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assigneeUser || !assigneeUser.isActive || (assigneeUser.role !== "STAFF" && assigneeUser.role !== "ADMIN")) {
        return res.status(400).json({
          code: "INACTIVE_ASSIGNEE",
          error: "Bad Request",
          message: "Cannot assign action to an inactive user or non-staff role."
        });
      }
    }

    const action = await prisma.actionTaken.create({
      data: {
        ticketId,
        performedById: userId,
        assigneeId: assigneeId || undefined,
        status: actionStatus as any,
        actionDateTime: actionDateTime ? new Date(actionDateTime) : new Date(),
        description: description.trim(),
        result: result ? result.trim() : null,
        followUpRequired: Boolean(followUpRequired),
        followUpNote: followUpRequired && followUpNote ? followUpNote.trim() : null,
        attachmentNotes: attachmentNotes ? attachmentNotes.trim() : null,
        version: 1
      },
      include: {
        performedBy: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    res.status(201).json({
      message: "Action Taken recorded successfully",
      action
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Handler for PATCH /api/tickets/:ticketId/actions/:actionId and /api/tickets/:id/actions/:actionId
const handleUpdateAction = async (req: Request, res: Response) => {
  const userRole = res.locals.user.role;
  const ticketId = req.params.ticketId || req.params.id;
  const actionId = req.params.actionId;

  if (userRole !== "STAFF" && userRole !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden", message: "Updating Actions Taken is restricted to IT Staff and Administrators" });
  }

  const { description, result, assigneeId, status, followUpRequired, followUpNote, attachmentNotes, expectedVersion } = req.body;

  try {
    const prisma = getPrisma();
    const existingAction = await prisma.actionTaken.findFirst({
      where: { id: actionId, ticketId }
    });

    if (!existingAction) {
      return res.status(404).json({ error: "Not Found", message: "Action Taken or Ticket not found" });
    }

    // Terminal Lock Check (BR-03)
    if (existingAction.status === "COMPLETED" || existingAction.status === "CANCELLED") {
      return res.status(400).json({
        code: "TERMINAL_ACTION_LOCKED",
        error: "Bad Request",
        message: "Completed or cancelled actions are permanently locked and cannot be modified."
      });
    }

    // Assignee Inactive Check (BR-02)
    if (assigneeId !== undefined && assigneeId !== null && assigneeId !== "") {
      const assigneeUser = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assigneeUser || !assigneeUser.isActive || (assigneeUser.role !== "STAFF" && assigneeUser.role !== "ADMIN")) {
        return res.status(400).json({
          code: "INACTIVE_ASSIGNEE",
          error: "Bad Request",
          message: "Cannot assign action to an inactive user or non-staff role."
        });
      }
    }

    const nextStatus = status ? status.toUpperCase() : existingAction.status;
    const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (status && !validStatuses.includes(nextStatus)) {
      return res.status(400).json({ error: "Bad Request", message: "Invalid action status value" });
    }

    // Completion Result Check (BR-03)
    if (nextStatus === "COMPLETED") {
      const finalResult = result !== undefined ? result : existingAction.result;
      if (!finalResult || typeof finalResult !== "string" || finalResult.trim().length === 0) {
        return res.status(400).json({ error: "Bad Request", message: "Result is required when action is marked as COMPLETED" });
      }
    }

    // Follow-up Note Check (BR-03)
    const finalFollowUpRequired = followUpRequired !== undefined ? Boolean(followUpRequired) : existingAction.followUpRequired;
    const finalFollowUpNote = followUpNote !== undefined ? followUpNote : existingAction.followUpNote;
    if (finalFollowUpRequired && (!finalFollowUpNote || typeof finalFollowUpNote !== "string" || finalFollowUpNote.trim().length === 0)) {
      return res.status(400).json({ error: "Bad Request", message: "Follow-up note is required when follow-up is required." });
    }

    const updateData: any = {};
    if (description !== undefined) updateData.description = description.trim();
    if (result !== undefined) updateData.result = result ? result.trim() : null;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
    if (status !== undefined) updateData.status = nextStatus as any;
    
    if (followUpRequired !== undefined) {
      updateData.followUpRequired = Boolean(followUpRequired);
      if (!followUpRequired) {
        updateData.followUpNote = null;
      }
    }
    if (followUpNote !== undefined && Boolean(finalFollowUpRequired)) {
      updateData.followUpNote = followUpNote ? followUpNote.trim() : null;
    }
    if (attachmentNotes !== undefined) updateData.attachmentNotes = attachmentNotes ? attachmentNotes.trim() : null;

    if (expectedVersion !== undefined) {
      // Atomic Concurrency Predicate (BR-11)
      const updateResult = await prisma.actionTaken.updateMany({
        where: {
          id: actionId,
          ticketId,
          version: Number(expectedVersion)
        },
        data: {
          ...updateData,
          version: Number(expectedVersion) + 1
        }
      });

      if (updateResult.count === 0) {
        return res.status(409).json({
          error: "Conflict",
          message: "Action Taken has been updated by another user."
        });
      }
    } else {
      await prisma.actionTaken.update({
        where: { id: actionId },
        data: {
          ...updateData,
          version: existingAction.version + 1
        }
      });
    }

    const updatedAction = await prisma.actionTaken.findUnique({
      where: { id: actionId },
      include: {
        performedBy: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    res.status(200).json({
      message: "Action Taken updated successfully",
      action: updatedAction
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

router.patch("/:ticketId/actions/:actionId", handleUpdateAction);
router.patch("/:id/actions/:actionId", handleUpdateAction);

// GET /api/tickets/:id/history
router.get("/:id/history", async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
  const userRole = res.locals.user.role;
  const ticketId = req.params.id;

  try {
    const prisma = getPrisma();
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    if (userRole === "REQUESTER" && ticket.requesterId !== userId) {
      return res.status(403).json({ error: "Forbidden", message: "You do not own this ticket" });
    }

    const history = await prisma.ticketStatusHistory.findMany({
      where: { ticketId },
      orderBy: { changedAt: "asc" },
      include: {
        changedBy: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    res.status(200).json({ history });
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
