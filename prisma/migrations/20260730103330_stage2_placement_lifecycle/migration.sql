-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('WORKER_PLACEMENT', 'EMPLOYER_SERVICE', 'ANNUAL_PARTNERSHIP');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'AWAITING_SIGNATURE', 'EXECUTED', 'SUPERSEDED', 'TERMINATED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "WelfareMethod" AS ENUM ('CALL', 'MESSAGE', 'VISIT');

-- CreateEnum
CREATE TYPE "WellbeingStatus" AS ENUM ('GREEN', 'AMBER', 'RED');

-- CreateEnum
CREATE TYPE "CpdStatus" AS ENUM ('CURRENT', 'DUE_SOON', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('WORKER_NON_ATTENDANCE', 'WORKER_UNDERPERFORMANCE', 'WORKER_MISCONDUCT_MINOR', 'WORKER_MISCONDUCT_SERIOUS', 'EMPLOYER_UNFAIR_TREATMENT', 'EMPLOYER_NON_PAYMENT', 'PLATFORM_DISPUTE', 'DATA_PRIVACY');

-- CreateEnum
CREATE TYPE "ComplaintUrgency" AS ENUM ('CRITICAL', 'HIGH', 'STANDARD');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('SUBMITTED', 'TRIAGED', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'CLOSED', 'REOPENED');

-- CreateEnum
CREATE TYPE "ComplaintStage" AS ENUM ('TRIAGE', 'ACKNOWLEDGEMENT', 'INVESTIGATION', 'RESOLUTION', 'COMMUNICATION', 'CLOSURE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('ISSUED', 'PAID', 'OVERDUE', 'VOID');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('PLACEMENT_FEE', 'SUBSCRIPTION', 'CPD_REFRESH');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('CARE_NEEDS', 'WORKFORCE_REQUIREMENTS');

-- AlterTable
ALTER TABLE "EmployerProfile" ADD COLUMN     "assignedAgentId" TEXT;

-- AlterTable
ALTER TABLE "Placement" ADD COLUMN     "accountManagerId" TEXT,
ADD COLUMN     "actualEndDate" TIMESTAMP(3),
ADD COLUMN     "expectedEndDate" TIMESTAMP(3),
ADD COLUMN     "guaranteeWindowEnds" TIMESTAMP(3),
ADD COLUMN     "performanceNotes" TEXT,
ADD COLUMN     "replacementReason" TEXT,
ADD COLUMN     "replacesId" TEXT,
ADD COLUMN     "salary" INTEGER,
ADD COLUMN     "salaryCurrency" "Currency" NOT NULL DEFAULT 'NGN';

-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN     "cpdLastCompletedAt" TIMESTAMP(3),
ADD COLUMN     "cpdNextDueAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ContractTemplate" (
    "id" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "body" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "templateId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "populatedBody" TEXT NOT NULL,
    "pdfKey" TEXT,
    "pdfUrl" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'AWAITING_SIGNATURE',
    "partySignedAt" TIMESTAMP(3),
    "oakvaleSignedAt" TIMESTAMP(3),
    "terminatedAt" TIMESTAMP(3),
    "supersededById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelfareCheck" (
    "id" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "agentId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "WelfareMethod" NOT NULL,
    "attendanceConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "wellbeing" "WellbeingStatus" NOT NULL DEFAULT 'GREEN',
    "issues" TEXT,
    "actionTaken" TEXT,
    "reportPdfKey" TEXT,
    "reportPdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WelfareCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "caseRef" TEXT NOT NULL,
    "category" "ComplaintCategory" NOT NULL,
    "urgency" "ComplaintUrgency" NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'SUBMITTED',
    "stage" "ComplaintStage" NOT NULL DEFAULT 'TRIAGE',
    "raisedById" TEXT NOT NULL,
    "againstUserId" TEXT,
    "placementId" TEXT,
    "incidentDate" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "preferredResolution" TEXT,
    "assignedAgentId" TEXT,
    "slaDueAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "closedAt" TIMESTAMP(3),
    "satisfactionConfirmed" BOOLEAN,
    "reopenDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintEvent" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "actorId" TEXT,
    "stage" "ComplaintStage" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintDocument" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "placementId" TEXT,
    "type" "InvoiceType" NOT NULL DEFAULT 'PLACEMENT_FEE',
    "amount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'NGN',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paystackRef" TEXT,
    "lineItems" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "data" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContractTemplate_type_active_idx" ON "ContractTemplate"("type", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_supersededById_key" ON "Contract"("supersededById");

-- CreateIndex
CREATE INDEX "Contract_placementId_idx" ON "Contract"("placementId");

-- CreateIndex
CREATE INDEX "WelfareCheck_placementId_idx" ON "WelfareCheck"("placementId");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_caseRef_key" ON "Complaint"("caseRef");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- CreateIndex
CREATE INDEX "Complaint_assignedAgentId_idx" ON "Complaint"("assignedAgentId");

-- CreateIndex
CREATE INDEX "ComplaintEvent_complaintId_idx" ON "ComplaintEvent"("complaintId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE INDEX "Invoice_employerId_idx" ON "Invoice"("employerId");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_employerId_type_key" ON "Assessment"("employerId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Placement_replacesId_key" ON "Placement"("replacesId");

-- CreateIndex
CREATE INDEX "Placement_status_idx" ON "Placement"("status");

-- AddForeignKey
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_replacesId_fkey" FOREIGN KEY ("replacesId") REFERENCES "Placement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ContractTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelfareCheck" ADD CONSTRAINT "WelfareCheck_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelfareCheck" ADD CONSTRAINT "WelfareCheck_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_againstUserId_fkey" FOREIGN KEY ("againstUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintEvent" ADD CONSTRAINT "ComplaintEvent_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintEvent" ADD CONSTRAINT "ComplaintEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintDocument" ADD CONSTRAINT "ComplaintDocument_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "EmployerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "EmployerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

