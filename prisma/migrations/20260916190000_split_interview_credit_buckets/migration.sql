-- Interview credits split into two buckets with different period behaviour:
-- the monthly allowance is replaced at each boundary, purchased credits carry
-- over. The existing balance was allowance-only, so rename it in place rather
-- than dropping and recreating (which would zero live balances).
ALTER TABLE "EmployerProfile" RENAME COLUMN "interviewCredits" TO "allowanceCredits";

ALTER TABLE "EmployerProfile" ADD COLUMN "purchasedCredits" INTEGER NOT NULL DEFAULT 0;
