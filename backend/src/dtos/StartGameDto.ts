export class StartGameDTO {
    private constructor(
        public readonly storyId: string,
        public readonly isRestart: boolean
    ) {}

    public static create(body: any): [string?, StartGameDTO?] {
        const { storyId, restart } = body;

        if (!storyId || typeof storyId !== 'string') {
            return ['storyId is required and must be a string']
        }

        return [undefined, new StartGameDTO(storyId, Boolean(restart))];
    }
}
