import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IPlayer extends Document {
  username: string;
  email: string;
  password?: string;
  createdAt?: Date;
}

const playerSchema = new Schema<IPlayer>(
  {
    username: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [1, 'User name must have at least 1 character'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must have at least 8 characters'],
      select: false, 
    },
  },
  {
    timestamps: true, 
  }
);

// hashing password before saving user 
playerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
});

export const Player = model<IPlayer>('Player', playerSchema);