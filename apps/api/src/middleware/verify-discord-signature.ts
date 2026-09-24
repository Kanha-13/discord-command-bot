import type { Request, Response, NextFunction } from "express";
import { verifyDiscordRequest } from "../integrations/discord/discord.crypto";

export function verifyDiscordSignature(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!publicKey) {
    return res.status(500).json({
      error: {
        code: "DISCORD_PUBLIC_KEY_MISSING",
        message: "Discord public key is not configured.",
      },
    });
  }

  const signature = req.header("X-Signature-Ed25519");
  const timestamp = req.header("X-Signature-Timestamp");

  if (!signature || !timestamp) {
    return res.status(401).json({
      error: {
        code: "INVALID_DISCORD_SIGNATURE",
        message: "Missing Discord signature headers.",
      },
    });
  }

  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({
      error: {
        code: "RAW_BODY_REQUIRED",
        message: "Raw request body is required.",
      },
    });
  }

  const valid = verifyDiscordRequest(
    publicKey,
    signature,
    timestamp,
    req.body,
  );

  if (!valid) {
    return res.status(401).json({
      error: {
        code: "INVALID_DISCORD_SIGNATURE",
        message: "Invalid Discord request signature.",
      },
    });
  }

  next();
}