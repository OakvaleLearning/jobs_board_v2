-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('LOCAL_NG', 'DIASPORA_GLOBAL');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'PAST_DUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PAYSTACK', 'FLUTTERWAVE', 'STRIPE', 'PAYPAL');

-- AlterEnum
ALTER TYPE "Currency" ADD VALUE 'CAD';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InvoiceType" ADD VALUE 'PLAN_SUBSCRIPTION';
ALTER TYPE "InvoiceType" ADD VALUE 'INTERVIEW_CREDIT';

-- AlterTable
ALTER TABLE "EmployerProfile" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'LOCAL_NG',
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "creditsGrantedAt" TIMESTAMP(3),
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'NGN',
ADD COLUMN     "interviewCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "planTier" "PlanTier",
ADD COLUMN     "subscribedAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE';

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "creditCharged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "meetingUrl" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "provider" "PaymentProvider",
ADD COLUMN     "providerRef" TEXT,
ADD COLUMN     "purchase" JSONB;

-- CreateTable
CREATE TABLE "CareLogWorkspace" (
    "id" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastDigestAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareLogWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareLogEntry" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "loggedFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bloodPressure" TEXT,
    "temperature" DOUBLE PRECISION,
    "pulse" INTEGER,
    "weight" DOUBLE PRECISION,
    "medicationsTaken" TEXT,
    "medicationTime" TEXT,
    "meals" TEXT,
    "activities" TEXT,
    "mood" TEXT,
    "notes" TEXT,
    "concernFlag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareLogWorkspace_placementId_key" ON "CareLogWorkspace"("placementId");

-- CreateIndex
CREATE INDEX "CareLogEntry_workspaceId_loggedFor_idx" ON "CareLogEntry"("workspaceId", "loggedFor");

-- AddForeignKey
ALTER TABLE "CareLogWorkspace" ADD CONSTRAINT "CareLogWorkspace_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareLogEntry" ADD CONSTRAINT "CareLogEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "CareLogWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareLogEntry" ADD CONSTRAINT "CareLogEntry_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
