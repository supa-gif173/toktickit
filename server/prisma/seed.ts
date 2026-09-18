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
  // And seed at least one ticket for tests
  const req1 = await prisma.user.findUnique({ where: { email: "req1@example.com" } });
  const cat1 = await prisma.category.findFirst();
  const sys1 = await prisma.relatedSystem.findFirst();

  if (req1 && cat1 && sys1) {
    await prisma.ticket.upsert({
      where: { ticketNumber: "TKT-0001" },
      update: {},
      create: {
        ticketNumber: "TKT-0001",
        summary: "Test Ticket",
        description: "Test description",
        status: "NEW",
        requestedPriority: "LOW",
        itPriority: "LOW",
        requesterId: req1.id,
        categoryId: cat1.id,
        systemId: sys1.id
      }
    });
  }

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
