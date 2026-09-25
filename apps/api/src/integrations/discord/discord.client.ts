
function getBotToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error("DISCORD_BOT_TOKEN is not configured.");
  }

  return token;
}

export async function discordRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${process.env.DISCORD_API_BASE}${path}`,
    {
      ...options,
      signal:
        options.signal ??
        AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bot ${getBotToken()}`,
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Discord API error ${response.status}: ${body}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}