import { getPrisma } from "../src/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  const prisma = getPrisma();
  
  // Seed categories
  const categories = ["Account and Access", "Hardware", "Software", "Network"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed related systems
  const systems = ["ERP System", "Email Server", "VPN", "Intranet"];
  for (const name of systems) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Seed Requesters
  const requesters = [
    { email: "req1@example.com", name: "Requester One", role: "REQUESTER" as const, isActive: true },
    { email: "req2@example.com", name: "Requester Two", role: "REQUESTER" as const, isActive: true },
    { email: "req3@example.com", name: "Requester Three", role: "REQUESTER" as const, isActive: true },
    { email: "req4@example.com", name: "Requester Four", role: "REQUESTER" as const, isActive: true },
    { email: "req-inactive@example.com", name: "Requester Inactive", role: "REQUESTER" as const, isActive: false },
  ];

  // Seed IT Staff
  const staff = [
    { email: "staff1@example.com", name: "IT Staff One", role: "STAFF" as const, isActive: true },
    { email: "staff2@example.com", name: "IT Staff Two", role: "STAFF" as const, isActive: true },
    { email: "staff3@example.com", name: "IT Staff Three", role: "STAFF" as const, isActive: true },
    { email: "staff-inactive@example.com", name: "IT Staff Inactive", role: "STAFF" as const, isActive: false },
  ];

  // Seed Admin
  const admin = [
    { email: "admin1@example.com", name: "Admin One", role: "ADMIN" as const, isActive: true },
  ];

  const allUsers = [...requesters, ...staff, ...admin];

  for (const user of allUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash: passwordHash,
        mustChangePassword: ["req1@example.com", "staff1@example.com", "admin1@example.com"].includes(user.email) ? false : true,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: ["req1@example.com", "staff1@example.com", "admin1@example.com"].includes(user.email) ? false : true,
        passwordHash: passwordHash,
      },
    });
  }

  // Ensure legacy data normalization for any seeded/existing tickets
  await prisma.ticket.updateMany({
    where: { status: "New" },
    data: { status: "NEW" },
  });
  await prisma.ticket.updateMany({
    where: { requestedPriority: "Low" },
    data: { requestedPriority: "LOW" },
  });
  await prisma.ticket.updateMany({
    where: { itPriority: "Low" },
    data: { itPriority: "LOW" },
  });

  const req1 = await prisma.user.findUnique({ where: { email: "req1@example.com" } });
  const req2 = await prisma.user.findUnique({ where: { email: "req2@example.com" } });
  const req3 = await prisma.user.findUnique({ where: { email: "req3@example.com" } });
  const staff1 = await prisma.user.findUnique({ where: { email: "staff1@example.com" } });
  const staff2 = await prisma.user.findUnique({ where: { email: "staff2@example.com" } });
  const catNetwork = await prisma.category.findUnique({ where: { name: "Network" } }) || await prisma.category.findFirst();
  const catHardware = await prisma.category.findUnique({ where: { name: "Hardware" } }) || await prisma.category.findFirst();
  const catSoftware = await prisma.category.findUnique({ where: { name: "Software" } }) || await prisma.category.findFirst();
  const sysVPN = await prisma.relatedSystem.findUnique({ where: { name: "VPN" } }) || await prisma.relatedSystem.findFirst();
  const sysERP = await prisma.relatedSystem.findUnique({ where: { name: "ERP System" } }) || await prisma.relatedSystem.findFirst();

  if (req1 && staff1 && staff2 && catNetwork && catHardware && catSoftware && sysVPN && sysERP) {
    // TKT-0001: Zero actions taken (to test resolution gate requirement)
    const tkt1 = await prisma.ticket.upsert({
      where: { ticketNumber: "TKT-0001" },
      update: {},
      create: {
        ticketNumber: "TKT-0001",
        summary: "New employee workstation setup",
        description: "Configure laptop and monitor for incoming hire.",
        status: "NEW",
        requestedPriority: "LOW",
        itPriority: "LOW",
        requesterId: req1.id,
        categoryId: catHardware.id,
        systemId: sysERP.id,
        version: 1
      }
    });

    // TKT-0002: Multiple actions with diverse statuses and staff assignees
    const tkt2 = await prisma.ticket.upsert({
      where: { ticketNumber: "TKT-0002" },
      update: {},
      create: {
        ticketNumber: "TKT-0002",
        summary: "VPN connection drops every 15 minutes",
        description: "Frequent disconnection when tunneling from home network.",
        status: "IN_PROGRESS",
        requestedPriority: "HIGH",
        itPriority: "HIGH",
        ownerId: staff1.id,
        requesterId: req1.id,
        categoryId: catNetwork.id,
        systemId: sysVPN.id,
        version: 1
      }
    });

    // Check actions for TKT-0002
    const existingActions2 = await prisma.actionTaken.findMany({ where: { ticketId: tkt2.id } });
    if (existingActions2.length === 0) {
      await prisma.actionTaken.create({
        data: {
          ticketId: tkt2.id,
          performedById: staff1.id,
          assigneeId: staff1.id,
          actionDateTime: new Date(Date.now() - 3600000 * 2),
          status: "COMPLETED",
          description: "Inspected network switch ports and reset VLAN configuration.",
          result: "Port 4 is operational. Host regained IP address.",
          followUpRequired: true,
          followUpNote: "Monitor connection stability over the next 24 hours.",
          attachmentNotes: "router-diagnostic.log",
          version: 1
        }
      });

      await prisma.actionTaken.create({
        data: {
          ticketId: tkt2.id,
          performedById: staff2.id,
          assigneeId: staff2.id,
          actionDateTime: new Date(Date.now() - 1800000),
          status: "IN_PROGRESS",
          description: "Configuring failover route to secondary gateway.",
          result: null,
          followUpRequired: false,
          version: 1
        }
      });
    }

    // TKT-0003: Open ticket with pending action
    const tkt3 = await prisma.ticket.upsert({
      where: { ticketNumber: "TKT-0003" },
      update: {},
      create: {
        ticketNumber: "TKT-0003",
        summary: "Laptop battery drains quickly",
        description: "Battery discharges from 100% to 10% in under 45 minutes.",
        status: "OPEN",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        ownerId: staff2.id,
        requesterId: req2 ? req2.id : req1.id,
        categoryId: catHardware.id,
        systemId: sysERP.id,
        version: 1
      }
    });

    const existingActions3 = await prisma.actionTaken.findMany({ where: { ticketId: tkt3.id } });
    if (existingActions3.length === 0) {
      await prisma.actionTaken.create({
        data: {
          ticketId: tkt3.id,
          performedById: staff2.id,
          assigneeId: staff2.id,
          status: "PENDING",
          description: "Order replacement battery pack and run diagnostic calibration.",
          result: null,
          followUpRequired: false,
          version: 1
        }
      });
    }

    // TKT-0004: Resolved ticket with completed action
    const tkt4 = await prisma.ticket.upsert({
      where: { ticketNumber: "TKT-0004" },
      update: {},
      create: {
        ticketNumber: "TKT-0004",
        summary: "Software license activation error for CAD tool",
        description: "Error 403 on client license server handshake.",
        status: "RESOLVED",
        requestedPriority: "URGENT",
        itPriority: "URGENT",
        ownerId: staff1.id,
        requesterId: req1.id,
        categoryId: catSoftware.id,
        systemId: sysERP.id,
        version: 2
      }
    });

    const existingActions4 = await prisma.actionTaken.findMany({ where: { ticketId: tkt4.id } });
    if (existingActions4.length === 0) {
      await prisma.actionTaken.create({
        data: {
          ticketId: tkt4.id,
          performedById: staff1.id,
          assigneeId: staff1.id,
          status: "COMPLETED",
          description: "Reissued network license token from central server.",
          result: "License successfully verified and activated on client workstation.",
          followUpRequired: false,
          version: 1
        }
      });
    }

    // Seed TicketStatusHistory idempotently
    for (const [tkt, fromStatus, toStatus] of [
      [tkt2, "NEW", "IN_PROGRESS"],
      [tkt3, "NEW", "OPEN"],
      [tkt4, "IN_PROGRESS", "RESOLVED"]
    ] as const) {
      const existingHistory = await prisma.ticketStatusHistory.findFirst({
        where: { ticketId: tkt.id }
      });
      if (!existingHistory) {
        await prisma.ticketStatusHistory.create({
          data: {
            ticketId: tkt.id,
            fromStatus,
            toStatus,
            changedById: staff1.id,
            changedAt: new Date()
          }
        });
      }
    }
  }

  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
