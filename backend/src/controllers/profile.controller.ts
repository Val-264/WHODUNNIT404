import type { Request, Response, NextFunction } from "express";
import { ProfileService } from "../services/profile.service";

export class ProfileController {
    public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            const playerId = req.user?.id;

            if (!playerId) {
                res.status(401).json({success: false, message: 'Unauthorized: Missing user payload'});
                return;
            }

            const profileData = await ProfileService.serve_profile(playerId);

            res.status(200).json({
                success: true,
                data: profileData,
            });
            return;
        } catch (error) {
            const err = error as Error;

            if (err.message === 'PLAYER_NOT_FOUND') {
                res.status(404).json({succes: false, message: 'Player not found'});
                return;
            }
            next(error);
        }
    }
}