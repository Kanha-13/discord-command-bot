import { prisma } from "../configs/database";

export async function createSession(data: {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}) {
  return prisma.session.create({
    data,
  });
}

export async function findSession(tokenHash: string) {
  return prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });
}

export async function deleteSession(tokenHash: string) {
  return prisma.session.deleteMany({
    where: {
      tokenHash,
    },
  });
}