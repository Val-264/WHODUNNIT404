// This file manage case consultation and random inicialization

import { Story } from '../models/Story';

import { GameSession} from '../models/GameSession';
import { CaseListResponseDTO } from '../dtos/CaseListResponseDto';


export class GameService {

    /*
    Retrieve the three cases and indicate which ones 
    have a saved/active game for the player 
    */ 
   public static async getAvailableCases(playerId: string) {
    const stories = await Story.find().limit(3);

    const activeSessions = await GameSession.find({
        playerId, 
        status: 'IN_PROGRESS',
    });

    const activeMap = new Map<string, string>();
    activeSessions.forEach((sessions) => {
        activeMap.set(sessions.story_id.toString(), sessions._id.toString());
    });

    return CaseListResponseDTO.render(stories, activeMap);
   }

   
}