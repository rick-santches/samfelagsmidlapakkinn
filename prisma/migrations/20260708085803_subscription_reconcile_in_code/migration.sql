-- DropIndex
DROP INDEX "Subscription_orgId_merchantName_cadence_currentAmountCents_key";

-- CreateIndex
CREATE INDEX "Subscription_orgId_merchantName_idx" ON "Subscription"("orgId", "merchantName");
