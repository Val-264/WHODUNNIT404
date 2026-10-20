import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async(): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whodunnit404';

        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB connected in: ${conn.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}