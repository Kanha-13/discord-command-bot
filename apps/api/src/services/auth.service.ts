import {
  createUser,
  findByDiscordId,
  updateUser,
} from "../repositories/user.repository";
import {
  createSession,
  deleteSession,
  findSession,
} from "../repositories/session.repository";
import {
  generateSessionToken,
  hashSessionToken,
} from "../utils/session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

export async function upsertDiscordUser(data: {
  discordId: string;
  username: string;
  avatarUrl?: string;
}) {
  const existingUser = await findByDiscordId(data.discordId);

  if (existingUser) {
    return updateUser(data.discordId, {
      username: data.username,
      avatarUrl: data.avatarUrl,
    });
  }

  return createUser(data);
}

export async function createUserSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_MS,
  );

  await createSession({
    tokenHash,
    userId,
    expiresAt,
  });

  return {
    token,
    expiresAt,
  };
}

export async function getSessionByToken(token: string) {
  const tokenHash = hashSessionToken(token);

  const session = await findSession(tokenHash);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await deleteSession(tokenHash);
    return null;
  }

  return session;
}

export async function destroySession(token: string) {
  const tokenHash = hashSessionToken(token);

  await deleteSession(tokenHash);
}