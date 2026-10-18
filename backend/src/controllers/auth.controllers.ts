import type { Request, Response, NextFunction } from 'express';
import { RegisterPlayerDTO } from '../dtos/RegisterPlayerDto';
import { AuthService } from '../services/auth.services';

export class AuthController {
  public static async registerPlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate and sanitize the body using the DTO 
      const dto = RegisterPlayerDTO.create(req.body);

      const player = await AuthService.register(dto);

      res.status(201).json({
        success: true,
        message: 'Player successfully registered',
        data: player,
      });
    } catch (error) {
      const err = error as Error;

      // Specific errors returned by authservice
      if (err.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(409).json({ success: false, message: 'The email is already registered' });
        return;
      }

      if (err.message === 'USER_ALREADY_EXISTS') {
        res.status(409).json({ success: false, message: 'User name already exists' });
        return;
      }

      // Si el error viene de la validación del DTO (error de entrada)
      if (err.message.includes('obligatory') || err.message.includes('must have') || err.message.includes('valid')) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }

      // If it is an unhandled error, it is passed to the errorHandler
      next(error);
    }
  }
}