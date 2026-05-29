import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error("[ERROR]", err);
  res.status(500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}

export function asyncHandler(
  fn: (req: any, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: any, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
