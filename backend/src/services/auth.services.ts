import { Player, IPlayer } from '../models/Player';
import { RegisterPlayerDTO } from '../dtos/RegisterPlayerDto';
import { LoginPlayerDTO } from '../dtos/LoginPlayerDto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

    // Return user data without password 
    return {
      _id: newPlayer._id,
      username: newPlayer.username,
      email: newPlayer.email,
      createdAt: newPlayer.createdAt,
    };
  }

  /** 
  * @param dto user credential previously sanitized 
  * @return Signed JWT token 
   */ 
  public static async login(dto: LoginPlayerDTO): Promise<string> {
    // Determine if the identifier is an email or username and check if it exisits on database 
    const player = await Player.findOne(
      dto.isEmail() ? { email: dto.identifier } : { username: dto.identifier }
    ).select('+password'); // To be sure MongoDb brings the hash

    // If user doesn't exists on database 
    if (!player || !player.password) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Compare the password sent with the hash stored in db
    const isPasswordValid = await bcrypt.compare(dto.password, player.password)
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Create and retunr JWT token 
    const secret =process.env.JWT_SECRET || 'default_secret';
    const token = jwt.sign(
      { id: player._id, username: player.username, email: player.email },
      secret,
      { expiresIn: '1d'}
    )

    return token;
  }
}