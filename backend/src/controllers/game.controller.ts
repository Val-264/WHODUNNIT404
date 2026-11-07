import type { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/game.services';
import { StartGameDTO } from '../dtos/StartGameDto';

export class GameController {
    public static async getCases(req:Request, res: Response, next: NextFunction): Promise<void> {   
        try {
            const playerId = req.user?.id;
            if (!playerId) {
                res.status(401).json({success: false, message: 'Unauthorized'});
                return;
            }

            const cases = await GameService.getAvailableCases(playerId);
            res.status(200).json({success: true, data: cases});
        } catch (error) {
            next(error);
        }
    }

    
}