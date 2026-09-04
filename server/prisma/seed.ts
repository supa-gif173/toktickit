import { getPrisma } from "../src/prisma.js";

// Issue 3 — seed the four supported categories.
// The four names are: Account and Access, Hardware, Software, Network.
// Requirement: running the seed twice must NOT create duplicates.
// Hint: prisma.category.upsert({ where:{name}, update:{}, create:{name} }).
async function main() {
  const prisma = getPrisma();
  const categories = ["Account and Access", "Hardware", "Software", "Network"];
  
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed mock Requesters for Lab 2
  const requesters = [
    { name: "John Doe", email: "john.doe@example.com", department: "Engineering" },
    { name: "Jane Smith", email: "jane.smith@example.com", department: "HR" },
    { name: "Alice Johnson", email: "alice.j@example.com", department: "Finance" }
  ];
  for (const req of requesters) {
    await prisma.requesterUser.upsert({
      where: { email: req.email },
      update: {},
      create: req,
    });
  }

  // Seed mock Related Systems for Lab 2
  const systems = ["ERP System", "Email Server", "VPN", "Intranet"];
  for (const name of systems) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: {},
      create: { name },
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
