import { Schema, model, Document, Types } from 'mongoose';

export interface IGameSession extends Document {
    player_id: Types.ObjectId;
    story_id: Types.ObjectId;
    status: 'IN_PROGRESS' |'SOLVED' | 'FAILED';
    started_at: Date
}

const GameSessionSchema = new Schema<IGameSession>({
    player_id: {
        type: Schema.Types.ObjectId, 
        ref: 'Player',
        required: true
    },
    story_id: {
        type: Schema.Types.ObjectId,
        ref: 'Story',
        required: true
    },
    status: {
        type: String,
        enum: ['IN_PROGRESS', 'SOLVED', 'FAILED'],
        default: 'IN_PROGRESS',
        required: true
    },
    started_at: {
        type: Date, 
        default: Date.now
    }
});

export const GameSession = model<IGameSession>('GameSession', GameSessionSchema);