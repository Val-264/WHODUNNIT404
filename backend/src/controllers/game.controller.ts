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

    public static async startGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user?.id;
            if (!playerId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const [error, dto] = StartGameDTO.create(req.body);
            if (error) {
                res.status(400).json({ success: false, message: error });
                return;
            }

            const gameData = await GameService.startGame(playerId, dto!);
            res.status(201).json({ success: true, data: gameData });
        } catch (error) {
            const err = error as Error;
            if (err.message === 'STORY_NOT_FOUND') {
                res.status(404).json({ success: false, message: 'Story not found' });
                return;
            }

            if (err.message === 'INSUFFICIENT_GAME_DATA') {
                res.status(500).json({
                    success: false,
                    message: 'Database requires at least 9 suspects and 9 places',
                });
                return;
            }
            next(error);
        }
    }    
}