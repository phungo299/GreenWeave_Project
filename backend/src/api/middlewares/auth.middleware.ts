import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/config';
import { ITokenPayload, UserRole } from '../interfaces/user.interface';
import User from '../models/user.model';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized - No token provided'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwtSecret as jwt.Secret) as ITokenPayload;
      
      // Find user by id
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized - Invalid token'
        });
        return;
      }

      // Attach user and token to request object
      req.user = user;
      req.token = token;
      
      next();
    } catch (err) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized - Invalid token'
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      status: 'error',
      message: 'Unauthorized - Authentication required'
    });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({
      status: 'error',
      message: 'Forbidden - Admin access required'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user owns the resource or is an admin
 */
export const isOwnerOrAdmin = (idParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized - Authentication required'
      });
      return;
    }

    const isAdmin = req.user.role === UserRole.ADMIN;
    const isOwner = req.user._id.toString() === req.params[idParam];

    if (!isAdmin && !isOwner) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden - You do not have permission to access this resource'
      });
      return;
    }

    next();
  };
}; 