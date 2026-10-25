import { Schema, model, Document } from 'mongoose';

export interface ISuspect extends Document {
    suspect_name: string, 
    bio: string,
    img_url: string
}

const SuspectSchema = new Schema<ISuspect>({
    suspect_name: {
        type: String, 
        required: true
    },
    bio: {
        type: String, 
        required: true
    },
    img_url: {
        type: String, 
        required: true
    }
});

export const Suspect = model<ISuspect>('Suspect', SuspectSchema);

