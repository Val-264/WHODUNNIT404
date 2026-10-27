import { isValidEmail } from "../utils/validators";
import { isValidPassword } from "../utils/validators";

export class RegisterPlayerDTO {
  private constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string
  ) {}

  public static create(obj: unknown): RegisterPlayerDTO {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Player data is required');
    }

    const { username, email, password, confirmPassword } = obj as Record<string, unknown>;

    if (!username || typeof username !== 'string' || !username.trim()) {
      throw new Error('name is required');
    }
    if (username.trim().length < 1) {
      throw new Error('user name must have at least 1 character');
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      throw new Error('email is required');
    }



    if (!password || typeof password !== 'string' || !isValidPassword(password)) {
        throw new Error('Password must have at least 8 characters, an uppercase, a lowercase and a number');
    }

    if (!confirmPassword || typeof confirmPassword !== 'string') {
      throw new Error('confirmPassword is required');
    }

    if (password !== confirmPassword) {
      throw new Error('Password do not match');
    }

    return new RegisterPlayerDTO(
      username.trim(),
      email.trim().toLowerCase(),
      password
    );
  }
}