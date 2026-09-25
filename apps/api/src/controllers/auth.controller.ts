import type { Request, Response } from "express";
import {
  getDiscordOAuthUrl,
  exchangeCodeForToken,
  getDiscordUser,
} from "../integrations/discord/discord.oauth";
import {
  createUserSession,
  destroySession,
  upsertDiscordUser,
} from "../services/auth.service";
import {
  getOAuthStateCookieOptions,
  getSessionCookieOptions,
  OAUTH_STATE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "../configs/auth";
import { generateOAuthState } from "../utils/oauth-state";

export function redirectToDiscord(_req: Request, res: Response) {
  const state = generateOAuthState();

  res.cookie(
    OAUTH_STATE_COOKIE_NAME,
    state,
    getOAuthStateCookieOptions(),
  );

  return res.redirect(getDiscordOAuthUrl());
}

export async function discordCallback(
  req: Request,
  res: Response,
) {
  const { code, state } = req.query;

  if (
    typeof code !== "string" ||
    typeof state !== "string"
  ) {
    return res.status(400).json({
      error: {
        code: "INVALID_OAUTH_CALLBACK",
        message: "Missing OAuth code or state.",
      },
    });
  }

  const storedState = req.cookies?.[OAUTH_STATE_COOKIE_NAME];

  if (!storedState || storedState !== state) {
    return res.status(401).json({
      error: {
        code: "INVALID_OAUTH_STATE",
        message: "Invalid OAuth state.",
      },
    });
  }

  res.clearCookie(
    OAUTH_STATE_COOKIE_NAME,
    getOAuthStateCookieOptions(),
  );

  const tokenResponse = await exchangeCodeForToken(code);

  const discordUser = await getDiscordUser(
    tokenResponse.access_token,
  );

  const avatarUrl = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : undefined;

  const user = await upsertDiscordUser({
    discordId: discordUser.id,
    username:
      discordUser.global_name ?? discordUser.username,
    avatarUrl,
  });

  const session = await createUserSession(user.id);

  res.cookie(
    SESSION_COOKIE_NAME,
    session.token,
    getSessionCookieOptions(),
  );

  const webAppUrl =
    process.env.WEB_APP_URL ?? "http://localhost:5173";

  return res.redirect(webAppUrl);
}

export async function getCurrentUser(
  req: Request,
  res: Response,
) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication is required.",
      },
    });
  }

  return res.json({
    data: {
      id: user.id,
      discordId: user.discordId,
      username: user.username,
      avatarUrl: user.avatarUrl,
      role: user.role,
    },
  });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (token) {
    await destroySession(token);
  }

  res.clearCookie(
    SESSION_COOKIE_NAME,
    getSessionCookieOptions(),
  );

  return res.status(204).send();
}