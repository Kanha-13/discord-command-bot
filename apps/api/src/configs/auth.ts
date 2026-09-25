export const SESSION_COOKIE_NAME = "discord_bot_session";

export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
export const OAUTH_STATE_COOKIE_NAME = "discord_oauth_state";

export const OAUTH_STATE_DURATION_MS = 1000 * 60 * 5;

export function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: SESSION_DURATION_MS,
    path: "/",
  };
}

export function getOAuthStateCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: OAUTH_STATE_DURATION_MS,
    path: "/api/auth",
  };
}