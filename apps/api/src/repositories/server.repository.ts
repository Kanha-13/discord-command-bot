import {prisma} from "../configs/database";

export async function findAll() {
  return prisma.discordServer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findById(id: string) {
  return prisma.discordServer.findUnique({
    where: {
      id,
    },
    include: {
      configuration: true,
    },
  });
}

export async function findByGuildId(guildId: string) {
  return prisma.discordServer.findUnique({
    where: {
      guildId,
    },
  });
}

export async function createServer(data: {
  guildId: string;
  name: string;
}) {
  return prisma.discordServer.create({
    data: {
      guildId: data.guildId,
      name: data.name,
    },
  });
}