import { IPlayer } from '../models/Player';
import { IGameSession } from '../models/GameSession';

export interface GameHistoryItem {
    caseTitle: string;
    status: 'SOLVED' | 'FAILED';
    completedAt?: Date;
}

export class ProfileResponseDTO {
    private constructor(
        public readonly id: string,
        public readonly username: string,
        public readonly email: string,
        public readonly profileImg: string,
        public readonly history: GameHistoryItem[]
    ) {}

    public static create(player: IPlayer, sessions: IGameSession[]): ProfileResponseDTO {
        const formattedHistory: GameHistoryItem[] = sessions.map((session) => {
            const story = session.story_id as unknown as { title: string};

            return {
                caseTitle: story && story.title ? story.title: 'Unknown Case',
                status: session.status as 'SOLVED' | 'FAILED',
                completedAt: session.started_at,
            };
        });

        return new ProfileResponseDTO (
            player._id.toString(),
            player.username,
            player.email,
            player.profileImg || '',
            formattedHistory
        )
    }
}