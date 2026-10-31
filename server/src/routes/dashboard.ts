import { Router, Request, Response } from "express";
import { getPrisma } from "../prisma.js";
import { requireAuth, requireStaffOrAdmin } from "../middleware/auth.js";

const router = Router();

// ============================================================================
// 1. GET /api/dashboard/requester
// Authoritative dashboard metrics for the authenticated Requester (BR-08)
// ============================================================================
router.get("/requester", requireAuth, async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const userId = res.locals.user.userId;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [myOpenTickets, waitingForRequester, recentlyResolved, recentTickets] = await Promise.all([
      // Count of active tickets submitted by the requester (not resolved, closed, or cancelled)
      prisma.ticket.count({
        where: {
          requesterId: userId,
          status: { notIn: ["RESOLVED", "CLOSED", "CANCELLED"] },
        },
      }),

      // Count of tickets waiting for requester input
      prisma.ticket.count({
        where: {
          requesterId: userId,
          status: "WAITING_FOR_REQUESTER",
        },
      }),

      // Count of tickets resolved within 30 days
      prisma.ticket.count({
        where: {
          requesterId: userId,
          status: { in: ["RESOLVED", "CLOSED"] },
          updatedAt: { gte: thirtyDaysAgo },
        },
      }),

      // 5 most recently updated tickets
      prisma.ticket.findMany({
        where: { requesterId: userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          ticketNumber: true,
          summary: true,
          status: true,
          requestedPriority: true,
          itPriority: true,
          version: true,
          updatedAt: true,
        },
      }),
    ]);

    res.status(200).json({
      metrics: {
        myOpenTickets,
        waitingForRequester,
        recentlyResolved,
      },
      recentTickets,
    });
  } catch (error) {
    console.error("Error retrieving requester dashboard:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: "Failed to load dashboard metrics" });
  }
});

// ============================================================================
// 2. GET /api/dashboard/staff
// Operational service-desk metrics for IT Staff & Administrators (BR-09, BR-10)
// ============================================================================
router.get("/staff", requireStaffOrAdmin, async (req: Request, res: Response) => {
  try {
    const prisma = getPrisma();
    const staffId = res.locals.user.userId;
    const userRole = res.locals.user.role;

    const activeFilter = {
      status: { notIn: ["RESOLVED", "CLOSED", "CANCELLED"] },
    };

    const [
      newTickets,
      openTickets,
      inProgressTickets,
      waitingForRequester,
      myAssignedTickets,
      unassignedTickets,
      priorityGroups,
      recentQueueTickets,
    ] = await Promise.all([
      prisma.ticket.count({ where: { status: "NEW" } }),
      prisma.ticket.count({ where: { status: "OPEN" } }),
      prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { status: "WAITING_FOR_REQUESTER" } }),
      prisma.ticket.count({ where: { ownerId: staffId, ...activeFilter } }),
      prisma.ticket.count({ where: { ownerId: null, ...activeFilter } }),
      prisma.ticket.groupBy({
        by: ["itPriority"],
        where: activeFilter,
        _count: { _all: true },
      }),
      prisma.ticket.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          ticketNumber: true,
          summary: true,
          status: true,
          itPriority: true,
          version: true,
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          updatedAt: true,
        },
      }),
    ]);

    const ticketsByPriority: Record<string, number> = {
      URGENT: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    for (const group of priorityGroups) {
      if (group.itPriority && group.itPriority in ticketsByPriority) {
        ticketsByPriority[group.itPriority] = group._count._all;
      }
    }

    const responsePayload: any = {
      metrics: {
        newTickets,
        openTickets,
        inProgressTickets,
        waitingForRequester,
        myAssignedTickets,
        unassignedTickets,
      },
      ticketsByPriority,
      recentQueueTickets,
    };

    // If Administrator, attach system user metrics (BR-10)
    if (userRole === "ADMIN") {
      const [totalUsers, activeStaff, activeRequesters] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "STAFF", isActive: true } }),
        prisma.user.count({ where: { role: "REQUESTER", isActive: true } }),
      ]);

      responsePayload.adminStats = {
        totalUsers,
        activeStaff,
        activeRequesters,
      };
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error retrieving staff dashboard:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: "Failed to load dashboard metrics" });
  }
});

export default router;
