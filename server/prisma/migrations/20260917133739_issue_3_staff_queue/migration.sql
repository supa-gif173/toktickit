-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "itPriority" TEXT NOT NULL DEFAULT 'Low',
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "requestedPriority" TEXT NOT NULL DEFAULT 'Low';

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
