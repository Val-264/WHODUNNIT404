import { Request, Response, NextFunction } from 'express';

/*
Middleware to capturing and handling validation errors from DTOs or schemas 
*/
export const handleDtoError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // I fthe error originates from DTO or manual validation 
  if (err.message) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  next(err);
};