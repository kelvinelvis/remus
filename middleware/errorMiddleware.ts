import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: "Something went wrong!",
    error: err.message || "Internal Server Error",
    statusCode,
  });
};

export default errorMiddleware;
