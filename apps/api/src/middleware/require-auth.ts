import type { Request, Response, NextFunction } from "express";
import { SESSION_COOKIE_NAME } from "../configs/auth";
import { getSessionByToken } from "../services/auth.service";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      });
    }

    const session = await getSessionByToken(token);

    if (!session) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      });
    }

    req.user = session.user;

    return next();
  } catch (error) {
    return next(error);
  }
}