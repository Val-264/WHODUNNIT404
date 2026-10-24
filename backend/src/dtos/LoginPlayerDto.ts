export class LoginPlayerDTO {
    private constructor(
        public readonly identifier: string,
        public readonly password: string
    ) {}

    public static create(obj: Record<string,unknown>): [string?, LoginPlayerDTO?] {
        if (!obj || typeof obj !== 'object') {
            throw new Error('Player credentials are required');
        }   

        const { identifier, password } = obj as Record<string,unknown>;
        
        if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
            throw new Error ('Invalid credentials');
        }

        if (!password || typeof password !== 'string' || !password.trim()) {
            throw new Error('Invalid credentials');
        }

        const cleanIdentifier = identifier.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const formattedIdentifier = emailRegex.test(cleanIdentifier)
        ? cleanIdentifier.toLowerCase() // If it is email
        : cleanIdentifier;              // If it is username

        return  [
            undefined,
            new LoginPlayerDTO(formattedIdentifier, password)
        ];
    }
}