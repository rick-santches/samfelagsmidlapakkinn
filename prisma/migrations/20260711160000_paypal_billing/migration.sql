-- AlterTable: PayPal subscription reference on the org
ALTER TABLE "Organization" ADD COLUMN "paypalSubscriptionId" TEXT;
CREATE UNIQUE INDEX "Organization_paypalSubscriptionId_key" ON "Organization"("paypalSubscriptionId");

-- CreateTable: cache of PayPal billing-plan ids per plan+interval
CREATE TABLE "PaypalPlan" (
    "id" TEXT NOT NULL,
    "planKey" TEXT NOT NULL,
    "paypalPlanId" TEXT NOT NULL,
    CONSTRAINT "PaypalPlan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PaypalPlan_planKey_key" ON "PaypalPlan"("planKey");
