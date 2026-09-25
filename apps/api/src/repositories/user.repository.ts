import { prisma } from "../configs/database";

export async function findByDiscordId(discordId: string) {
  return prisma.user.findUnique({
    where: {
      discordId,
    },
  });
}

export async function createUser(data: {
  discordId: string;
  username: string;
  avatarUrl?: string;
}) {
  return prisma.user.create({
    data,
  });
}

export async function updateUser(
  discordId: string,
  data: {
    username: string;
    avatarUrl?: string;
  },
) {
  return prisma.user.update({
    where: {
      discordId,
    },
    data,
  });
}