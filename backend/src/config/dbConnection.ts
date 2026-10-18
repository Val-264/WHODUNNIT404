import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async(): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whodunnit404';

        const conn = await mongoose.connect(mongoURI);
    } catch {
        process.exit(1);
    }
}