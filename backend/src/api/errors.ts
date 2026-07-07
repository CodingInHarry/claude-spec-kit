import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFound(entity: string, id: string): ApiError {
  return new ApiError(404, `${entity.toUpperCase()}_NOT_FOUND`, `해당 ${entity}을(를) 찾을 수 없습니다.`, {
    id,
  });
}

export function badRequest(code: string, message: string, details?: unknown): ApiError {
  return new ApiError(400, code, message, details);
}

export function unprocessable(code: string, message: string, details?: unknown): ApiError {
  return new ApiError(422, code, message, details);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      details: err.details,
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "예기치 않은 오류가 발생했습니다.",
  });
}

export function asyncHandler<T extends (req: Request, res: Response) => Promise<void>>(fn: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch(next);
  };
}
