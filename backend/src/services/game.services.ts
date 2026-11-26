// This file manage case consultation and random inicialization

import { Story } from '../models/Story';
import { Suspect } from '../models/Suspect';
import { Place } from '../models/Place';
import { GameSession} from '../models/GameSession';
import { CaseListResponseDTO } from '../dtos/CaseListResponseDto';
import { StartGameDTO } from '../dtos/StartGameDto';
import { Dialogue } from '../models/Dialogue';
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
                { status: 'ABANDONED', completed_at: new Date() }
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
        const session = await GameSession.findById(gameId)
            .populate('story_id')
            .populate('suspect_locations.suspect_id', 'suspect_name bio img_url');

        if (!session) {
            throw new Error('GAME_NOT_FOUND');
        }


        if (session.player_id.toString() !== playerId) {
            throw new Error('FORBIDDEN_ACCESS');
        }

        const story = session.story_id as any;
        const places = await Place.find();

        if (places.length < 9) {
            throw new Error('INSUFFICIENT_GAME_DATA');
        }

        const suspectByPlaceMap = new Map<string, any>();
        session.suspect_locations.forEach((assignment: any) => {
            const suspectDoc = assignment.suspect_id;
            if(assignment.place_id && suspectDoc) {
                suspectByPlaceMap.set(assignment.place_id.toString(), {
                    id: suspectDoc._id,
                    name: suspectDoc.suspect_name,
                    bio: suspectDoc.bio, 
                    imgUrl: suspectDoc.img_url,
                });
            }
        });
        
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
            const placeIdStr = place?.id?.toString() || '';

            return {
                id: place?._id,
                name: place?.place_name,
                zoneInfo: place?.zone_info,
                imageUrl: place?.image_url,
                suspect: suspectByPlaceMap.get(placeIdStr) || null,
            };
        });

        return {
            id: session._id,
            status: session.status,
            title: story.title,
            victimName: story.victim_name,
            story: story.intro_text,
            context: story.intro_text,
            zones: orderedZones,
        };
    }

    // Add an extra line to the suspects lines based on the state of the game 
    public static async getSceneInterview(gameId: string, placeId: string, playerId: string) {
        const session = await GameSession.findById(gameId)
            .populate('suspect_locations.suspect_id', 'suspect_name')
            .populate('suspect_locations.place_id', 'place_name');

        if (!session) {
            throw new Error('GAME_NOT_FOUND');
        }


        if (session.player_id.toString() !== playerId) {
            throw new Error('FORBIDDEN_ACCESS');
        }
        
        const place = await Place.findById(placeId);
        if (!place) {
            throw new Error('PLACE_NOT_FOUND');
        }

        const assignment = session.suspect_locations.find(
            (item:any) => item.place_id._id.toString() === placeId
        );

        if (!assignment) {
            throw new Error('SUSPECT_NOT_ASSIGNED');
        }

        const suspectDoc = assignment.suspect_id as any;
        const suspect = await Suspect.findById(suspectDoc._id);
        if (!suspect) {
            throw new Error('SUSPECT_NOT_FOUND');
        }

        const dialogueDoc = await Dialogue.findOne({
            story_id: session.story_id,
            suspect_id: suspect._id
        });

        if (!dialogueDoc) {
            throw new Error('DIALOGUE_NOT_FOUND');
        }

        const guiltyIdStr = session.solution.guilty_suspect_id.toString();
        const crimeSceneIdStr = session.solution.crime_scene_id.toString();
        const isGuilty = guiltyIdStr === suspect._id.toString();

        // Copy the base lines from the seeder 
        const lines = isGuilty ? [...dialogueDoc.guilty_lines] : [...dialogueDoc.innocent_lines];

        // Generate the 3th line based on the state of teh game 
        const otherAssignments = session.suspect_locations.filter(
            (item: any) => item.suspect_id._id.toString() !== suspect._id.toString()
        );

        if (!isGuilty) {
            /*If the suspect is innocent, choose between ruling out a safe location 
            or confirming the real location of another innocente suspect*/
            const innocentOthers = otherAssignments.filter (
                (item: any) => item.suspect_id._id.toString() !== guiltyIdStr
            );
            const safePlaces = otherAssignments.filter(
                (item: any) => item.place_id._id.toString() !== crimeSceneIdStr
            );

            /*Use the last character of the suspect's ID to ensure 
            it is deterministic within the same session */ 
            const useLocationClue = suspect._id.toString().charCodeAt(23) % 2 === 0;

            if (useLocationClue && safePlaces.length > 0) {
                const picked = safePlaces[suspect._id.toString().charCodeAt(22) % safePlaces.length] as any;
                lines.push(`Por cierto, detective, pasé hace un momento por ${picked.place_id.place_name} y todo estaba completamente en orden.`);
            } else if (innocentOthers.length > 0) {
                const witness = innocentOthers[suspect._id.toString().charCodeAt(22) % innocentOthers.length] as any;
                lines.push(`Si le sirve de algo, vi a ${witness.suspect_id.suspect_name} en ${witness.place_id.place_name} hace un rato.`);
            }
        } else {
            /*If the suspect is guilty, he lies about the location of another suspect*/
            if (otherAssignments.length >= 2) {
                const target = otherAssignments[0] as any;
                const wrongPlace = otherAssignments[1] as any;
                lines.push(`Si busca respuestas, yo mismo vi a ${target.suspect_id.suspect_name} merodeando por ${wrongPlace.place_id.place_name}.`);
            }
        }

        // Save the current visited location 
        session.current_place_id = place._id as any;
        await session.save();

        return {
            place: {
                id: place._id,
                name: place.place_name,
                zoneInfo: place.zone_info,
                imageUrl: place.image_url,
            },
            suspect: {
                id: suspect._id,
                name: suspect.suspect_name,
                bio: suspect.bio,
                imgUrl: suspect.img_url,
            },
            dialogue: lines,
        };
    }
}