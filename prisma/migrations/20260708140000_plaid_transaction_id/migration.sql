-- AlterTable: store Plaid's stable transaction_id so a later sync can
-- update a "modified" charge or delete a "removed" one in place.
ALTER TABLE "Transaction" ADD COLUMN "plaidTransactionId" TEXT;

-- CreateIndex: unique per org (nullable — CSV rows have no Plaid id, and
-- Postgres allows multiple NULLs in a unique index).
CREATE UNIQUE INDEX "Transaction_orgId_plaidTransactionId_key" ON "Transaction"("orgId", "plaidTransactionId");
