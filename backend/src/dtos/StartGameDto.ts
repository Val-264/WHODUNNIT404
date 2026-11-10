export class StartGameDTO {
    private constructor(
        public readonly story_id: string,
        public readonly isRestart: boolean
    ) {}

    public static create(body: any): [string?, StartGameDTO?] {
        const { story_id, restart } = body;

        if (!story_id || typeof story_id !== 'string') {
            return ['story_id is required and must be a string']
        }

        return [undefined, new StartGameDTO(story_id, Boolean(restart))];
    }
}
