import { Player, IPlayer } from '../models/Player';
import { RegisterPlayerDTO } from '../dtos/RegisterPlayerDto';

export class AuthService {
  /**
   * Register new player on database 
   * @param dto User data previously sanitized
   * @returns Created user without password 
   */
  public static async register(dto: RegisterPlayerDTO): Promise<Partial<IPlayer>> {
    // Check if email already exists on database 
    const existingEmail = await Player.findOne({ email: dto.email });
    if (existingEmail) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // CheCk if user already exists on database 
    const existingUsername = await Player.findOne({ username: dto.username });
    if (existingUsername) {
      throw new Error('USER_ALREADY_EXISTS');
    }

    // Create an save new player in database 
    // Note: model 'Player' handles encrypting the password using bcrypt
    const newPlayer = new Player({
      username: dto.username,
      email: dto.email,
      password: dto.password,
    });

    await newPlayer.save();

    // Reurn user data without password 
    return {
      _id: newPlayer._id,
      username: newPlayer.username,
      email: newPlayer.email,
      createdAt: newPlayer.createdAt,
    };
  }
}