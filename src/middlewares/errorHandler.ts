import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Erro:', err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message,
  });
};
