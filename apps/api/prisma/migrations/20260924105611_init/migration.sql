-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "InteractionStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('DISCORD_RESPONSE', 'MIRROR_NOTIFICATION');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscordServer" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscordServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerConfiguration" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "commandChannelId" TEXT NOT NULL,
    "mirrorChannelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommandInteraction" (
    "id" TEXT NOT NULL,
    "interactionId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userDiscordId" TEXT NOT NULL,
    "commandName" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "InteractionStatus" NOT NULL DEFAULT 'RECEIVED',
    "response" TEXT,
    "error" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommandInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "interactionId" TEXT NOT NULL,
    "type" "ActionType" NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordServer_guildId_key" ON "DiscordServer"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "ServerConfiguration_serverId_key" ON "ServerConfiguration"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "CommandInteraction_interactionId_key" ON "CommandInteraction"("interactionId");

-- CreateIndex
CREATE INDEX "CommandInteraction_serverId_idx" ON "CommandInteraction"("serverId");

-- CreateIndex
CREATE INDEX "CommandInteraction_commandName_idx" ON "CommandInteraction"("commandName");

-- CreateIndex
CREATE INDEX "CommandInteraction_createdAt_idx" ON "CommandInteraction"("createdAt");

-- CreateIndex
CREATE INDEX "CommandInteraction_userDiscordId_idx" ON "CommandInteraction"("userDiscordId");

-- CreateIndex
CREATE INDEX "Action_interactionId_idx" ON "Action"("interactionId");

-- CreateIndex
CREATE INDEX "Action_status_idx" ON "Action"("status");

-- CreateIndex
CREATE INDEX "Action_type_status_idx" ON "Action"("type", "status");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerConfiguration" ADD CONSTRAINT "ServerConfiguration_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "DiscordServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandInteraction" ADD CONSTRAINT "CommandInteraction_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "DiscordServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "CommandInteraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
