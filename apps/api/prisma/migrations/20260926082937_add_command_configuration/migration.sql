-- DropForeignKey
ALTER TABLE "CommandInteraction" DROP CONSTRAINT "CommandInteraction_serverId_fkey";

-- CreateTable
CREATE TABLE "CommandConfiguration" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "commandName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommandConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommandConfiguration_serverId_idx" ON "CommandConfiguration"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "CommandConfiguration_serverId_commandName_key" ON "CommandConfiguration"("serverId", "commandName");

-- AddForeignKey
ALTER TABLE "CommandInteraction" ADD CONSTRAINT "CommandInteraction_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "DiscordServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandConfiguration" ADD CONSTRAINT "CommandConfiguration_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "DiscordServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
