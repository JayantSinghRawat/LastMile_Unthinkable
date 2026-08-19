import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlastmilekey123';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No authentication token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: 'ADMIN' | 'AGENT' | 'CUSTOMER' };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authorize = (roles: Array<'ADMIN' | 'AGENT' | 'CUSTOMER'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};
