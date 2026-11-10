import { Types } from 'mongoose';

export class StartGameDTO {
    private constructor(
        public readonly story_id: string,
        public readonly isRestart: boolean
    ) {}

    public static create(body: any): [string?, StartGameDTO?] {
        const { story_id, restart } = body;

        if (!story_id || typeof story_id !== 'string' || !Types.ObjectId.isValid(story_id)) {
            return ['Valid story_id (24 hex charcters) is required and must be a string']
        }

        return [undefined, new StartGameDTO(story_id, Boolean(restart))];
    }
}
