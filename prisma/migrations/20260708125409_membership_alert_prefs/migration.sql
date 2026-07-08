-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "emailInstantAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailWeeklyDigest" BOOLEAN NOT NULL DEFAULT true;
