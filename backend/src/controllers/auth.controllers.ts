import type { Request, Response, NextFunction } from 'express';
import { RegisterPlayerDTO } from '../dtos/RegisterPlayerDto';
import { AuthService } from '../services/auth.services';
import { LoginPlayerDTO } from '../dtos/LoginPlayerDto';

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

      // If error originates for bad body sintaxys 
      const spected_data = ['username', 'email', 'password', 'confirmPassword'];
      const missed_data = spected_data.filter(campo => !(campo in req.body));

      if (missed_data.length > 0) {
        res.status(400).json({message: `The following mandatory fields are missing: ${missed_data.join(', ')}`});
        return;
      }

      // If the error originates from DTO validation (input error)
      if (
        err.message === 'Player data is required' ||
        err.message === 'name is required' ||
        err.message === 'user name must have at least 1 character' ||
        err.message === 'email is required' ||
        err.message === 'confirmPassword is required' ||
        err.message === 'Password do not match' ||
        err.message.includes('Password must have')
      ) {
        res.status(400).json({ success: false, error: err.message });
        return;
      }

      // If it is an unhandled error, it is passed to the errorHandler
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate input with DTO
      const [error, loginDto] = LoginPlayerDTO.create(req.body);
      if (error) {
        res.status(401).json({ success: false, message: error });
        return;
      }

      const token = await AuthService.login(loginDto!);
      
      // Attach HTTP-Only cookie 
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // Expires on 1 day
      });

      // Send response without Response object
      res.status(200).json({ message: 'Login successful' });
      return;
    } catch (error) {
      next(error);
    }
  }
}