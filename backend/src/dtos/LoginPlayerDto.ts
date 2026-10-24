export class LoginPlayerDTO {
    private constructor(
        public readonly identifier: string,
        public readonly password: string
    ) {}

    public static create(obj: Record<string, unknown>): [string?, LoginPlayerDTO?] {
        if (!obj || typeof obj !== 'object') {
            return ['Player credentials are required', undefined];
        }   

        const { identifier, password } = obj as Record<string, unknown>;
        
        if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
            return ['Invalid credentials', undefined];
        }

        if (!password || typeof password !== 'string' || !password.trim()) {
            return ['Invalid credentials', undefined];
        }

        const cleanIdentifier = identifier.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const formattedIdentifier = emailRegex.test(cleanIdentifier)
            ? cleanIdentifier.toLowerCase() // If it is email
            : cleanIdentifier;              // If it is username

        return [
            undefined,
            new LoginPlayerDTO(formattedIdentifier, password)
        ];
    }
}