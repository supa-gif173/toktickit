import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";
import { mockAuthMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(mockAuthMiddleware);

router.post("/", async (req: Request, res: Response) => {
  const requesterId = res.locals.requesterId;
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
        status: "New",
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
  const requesterId = res.locals.requesterId;
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
  const requesterId = res.locals.requesterId;
  const ticketId = req.params.id;

  try {
    const ticket = await getPrisma().ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: true,
        system: true,
        attachments: {
          where: { deletedAt: null }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found" });
    }

    if (ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Forbidden", message: "You do not own this ticket" });
    }

    res.status(200).json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
