-- CreateEnum
CREATE TYPE "ActionAttemptStatus" AS ENUM ('PROCESSING', 'SUCCESS', 'FAILED');

-- DropIndex
DROP INDEX "Action_type_status_idx";

-- CreateTable
CREATE TABLE "ActionAttempt" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "status" "ActionAttemptStatus" NOT NULL,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ActionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActionAttempt_actionId_idx" ON "ActionAttempt"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "ActionAttempt_actionId_attempt_key" ON "ActionAttempt"("actionId", "attempt");

-- AddForeignKey
ALTER TABLE "ActionAttempt" ADD CONSTRAINT "ActionAttempt_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;
