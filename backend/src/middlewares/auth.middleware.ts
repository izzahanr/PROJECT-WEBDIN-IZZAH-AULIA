import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthUser = {
  id: number;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
};

export type AuthRequest = Request & {
  user?: AuthUser;
};

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token tidak ditemukan. Silakan login terlebih dahulu.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthUser;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid atau sudah expired. Silakan login kembali.' });
  }
};
