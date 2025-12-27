import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token não fornecido',
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido',
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        success: false,
        error: 'Token mal formatado',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      username: string;
    };

    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado',
    });
  }
};
