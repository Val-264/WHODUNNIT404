import { Player } from '../models/Player';
import { GameSession } from '../models/GameSession';
import { ProfileResponseDTO } from '../dtos/ProfileResponseDto';

export class ProfileService {
    /**
    * @param playerId player ID obteined from the session token 
    * @return Player profile info (Profile response DTO)
    */ 
    public static async serve_profile(playerId: string): Promise<ProfileResponseDTO> {
        const player = await Player.findById(playerId);
        if (!player) {
            throw new Error('PLAYER_NOT_FOUND');
        }

        // Find finished sessions (SOLVED or FAILED) and include Stoty title
        const sessions = await GameSession.find({
            player_id: playerId, 
            status: { $in: ['SOLVED', 'FAILED']},
        })
            .populate('story_id', 'title')
            .sort({ started_at: -1 })       // Sort from newest to oldest 

        // Create and return DTO instance
        return ProfileResponseDTO.create(player, sessions);
    }
}