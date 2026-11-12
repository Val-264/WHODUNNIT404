// This file manage case consultation and random inicialization

import { Story } from '../models/Story';
import { Suspect } from '../models/Suspect';
import { Place } from '../models/Place';
import { GameSession} from '../models/GameSession';
import { CaseListResponseDTO } from '../dtos/CaseListResponseDto';
import { StartGameDTO } from '../dtos/StartGameDto';

export class GameService {

    /*
    Retrieve the three cases and indicate which ones 
    have a saved/active game for the player 
    */ 
   public static async getAvailableCases(playerId: string) {
    const stories = await Story.find().limit(3);

    const activeSessions = await GameSession.find({
        player_id: playerId, 
        status: 'IN_PROGRESS',
    });

    const activeMap = new Map<string, string>();
    activeSessions.forEach((sessions) => {
        activeMap.set(sessions.story_id.toString(), sessions._id.toString());
    });

    return CaseListResponseDTO.render(stories, activeMap);
   }

    /*
    Start or restart a game
    */
    public static async startGame(player_id: string, dto: StartGameDTO) {
        const story = await Story.findById(dto.story_id);

        if (!story) {
            throw new Error('STORY_NOT_FOUND');
        }

        // If the player wants to restart the game
        if (dto.isRestart) {
            await GameSession.updateMany(
                { player_id, story_id: dto.story_id, status: 'IN_PROGRESS' }, 
                { status: 'ABANDONED' }
            );
        } else {
            const existing = await GameSession.findOne({
                player_id,
                story_id: dto.story_id, 
                status: 'IN_PROGRESS',
            });
            if (existing) {
                return this.formatGameResponse(existing, story);
            }
        }

        // Retrieve the 9 suspects and 9 places from db
        const suspects = await Suspect.find();
        const places = await Place.find();

        if (suspects.length < 9 || places.length < 9) {
            throw new Error('INSUFFICIENT_GAME_DATA');
        }

        /*
        Random selection for secret solution 
        (a guilty between nine, a crime scene between nine)
        */
        const randomGuilty = suspects[Math.floor(Math.random() * suspects.length)];
        const randomScene = places[Math.floor(Math.random() * places.length)];

        // Random shuffle the nine suspects on the nine locations (1 to 1)
        const shuffledPlaces = [...places].sort(() => Math.random() - 0.5);
        const suspectLocations = suspects.map((suspect, index) => {
            const targetPlace = shuffledPlaces[index];
            if (!targetPlace) {
                throw new Error('INSUFFICIENT_GAME_DATA');
            }

            return {
                suspect_id: suspect._id as any,
                place_id: targetPlace._id as any,
            };
        });

        if (!randomGuilty || !randomScene) {
            throw new Error('INSUFFICIENT_GAME_DATA');
        }

        // Create new game session
        const newSession = new GameSession({
            player_id,
            story_id: story._id,
            status: 'IN_PROGRESS',
            solution: {
                guilty_suspect_id: randomGuilty._id,
                crime_scene_id: randomScene._id,
                weapon_id: story.fixed_weapon_id,
            },
            suspect_locations: suspectLocations,
        });

        await newSession.save();

        return this.formatGameResponse(newSession, story);
    }

    private static formatGameResponse(session: any, story: any) {
        return {
            gameId: session._id,
            status: session.status,
            caseFile: {
                title: story.title,
                victimName: story.victim_name,
                introText: story.intro_text,
                weaponId: story.fixed_weapon_id,
            },
            createdAt: session.createdAt,
        };
    }

    public static async getGameById(gameId: string, playerId: string) {
        const session = await GameSession.findOne({ _id: gameId, player_id: playerId }).populate('story_id');

        if (!session) {
            throw new Error('GAME_NOT_FOUND');
        }

        const story = session.story_id as any;
        const places = await Place.find();

        if (places.length < 9) {
            throw new Error('INSUFFICIENT_GAME_DATA');
        }
        
        const fixedMapLayout = [
            'Teatro',             // Position 1
            'Cantina',            // Position 2
            'Biblioteca',         // Position 3
            'Hotel',              // Position 4
            'Plaza',              // Position 5 (Center)
            'Salón de baile',     // Position 6
            'Farmacia',           // Position 7
            'Café',               // Position 8
            'Fachada del banco',  // Position 9
        ];

        // Map the objects from MongoDB following the exact order from above
        const orderedZones = fixedMapLayout.map((placeName) => {
            const place = places.find((p) => p.place_name === placeName);
            return {
                id: place?._id,
                name: place?.place_name,
                zoneInfo: place?.zone_info,
                imageUrl: place?.image_url,
            };
        });

        return {
            id: session._id,
            title: story.title,
            victimName: story.victim_name,
            story: story.intro_text,
            context: story.intro_text,
            zones: orderedZones,
        };
    }
}