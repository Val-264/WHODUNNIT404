import { Schema, model, Document, Types } from 'mongoose';

export interface ISuspectLocation {
    suspect_id: Types.ObjectId;
    place_id: Types.ObjectId;
}

export interface IGameSession extends Document {
    player_id: Types.ObjectId;
    story_id: Types.ObjectId;
    status: 'IN_PROGRESS' |'SOLVED' | 'FAILED';
    started_at: Date;
    solution: {
        guilty_suspect_id: Types.ObjectId;
        crime_scene_id: Types.ObjectId;
        weapon_id: Types.ObjectId;
    };
    suspect_locations: ISuspectLocation[];
    current_place_id?: Types.ObjectId;
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
    }, 
    solution: {
        guilty_suspect_id: {
            type: Schema.Types.ObjectId, 
            ref:'Suspect', 
            required: true,
        }, 
        crime_scene_id: {
            type: Schema.Types.ObjectId,
            ref: 'Place',
            required: true,
        },
        weapon_id: {
            type: Schema.Types.ObjectId,
            ref: 'Weapon',
            required: true,
        }
    },
    suspect_locations: [
        {
            suspect_id: {
                type: Schema.Types.ObjectId,
                ref: 'Suspect',
                required: true, 
            },
            place_id: {
                type: Schema.Types.ObjectId,
                ref: 'Place',
                required: true,
            },
        },
    ],
    current_place_id: {
        type: Schema.Types.ObjectId,
        ref: 'Place',
    },    
},
{ timestamps: true }
);

export const GameSession = model<IGameSession>('GameSession', GameSessionSchema);