-- Admin suspension for employer accounts (additive, nullable)
ALTER TABLE "EmployerProfile" ADD COLUMN "suspendedAt" TIMESTAMP(3);
ALTER TABLE "EmployerProfile" ADD COLUMN "suspendedReason" TEXT;
