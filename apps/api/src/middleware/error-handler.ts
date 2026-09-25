import type {
  Request,
  Response,
  NextFunction,
} from "express";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("Unhandled API error:", error);

  if (res.headersSent) {
    return;
  }

  const message =
    error instanceof Error
      ? error.message
      : "Internal server error.";

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message,
    },
  });
}