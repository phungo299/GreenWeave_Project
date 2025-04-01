import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import logger from './logger';

// Interface for custom API error
export interface ApiError extends Error {
  statusCode: number;
  isOperational?: boolean;
}

// Custom API error class
export class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle errors during development
const sendErrorDev = (err: ApiError, res: Response) => {
  logger.error(`ERROR 💥: ${err.message}`);
  
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message,
    stack: err.stack,
    error: err
  });
};

// Handle errors during production
const sendErrorProd = (err: ApiError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// Handle MongoDB validation errors
const handleValidationErrorDB = (err: mongoose.Error.ValidationError): ApiError => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle MongoDB duplicate key errors
const handleDuplicateFieldsDB = (err: any): ApiError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

// Handle MongoDB cast errors
const handleCastErrorDB = (err: mongoose.Error.CastError): ApiError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = (): ApiError => {
  return new AppError('Invalid token. Please log in again.', 401);
};

// Handle JWT expiration errors
const handleJWTExpiredError = (): ApiError => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

// Global error handling middleware
export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Set default status code
  let error = err as ApiError;
  error.statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    // Handle specific error types
    if (err instanceof mongoose.Error.ValidationError) {
      error = handleValidationErrorDB(err);
    }
    
    if (err instanceof mongoose.Error.CastError) {
      error = handleCastErrorDB(err);
    }
    
    if ((err as any).code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }
    
    if ((err as any).name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    
    if ((err as any).name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};

// Catch async errors
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}; 