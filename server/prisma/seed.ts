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
        mustChangePassword: user.email === "req1@example.com" ? false : true,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: user.email === "req1@example.com" ? false : true,
        passwordHash: passwordHash,
      },
    });
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
