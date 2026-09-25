import type { Request, Response, NextFunction } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication is required.",
      },
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "Administrator access is required.",
      },
    });
  }

  return next();
}