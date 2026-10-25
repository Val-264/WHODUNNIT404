import { Schema, model, Document, Types } from 'mongoose';

export interface IStory extends Document{
    title: string,
    victim_name: string,
    fixed_weapon_id: Types.ObjectId,
    intro_text: string
}

const StorySchema = new Schema<IStory>({
    title: {
        type: String,
        required: true
    },
    victim_name: {
        type: String, 
        required: true
    },
    fixed_weapon_id: {
        type: Schema.Types.ObjectId,
        ref: 'Weapon'
    },
    intro_text: {
        type: String,
        required: true
    }
});

export const Story = model<IStory>('Story', StorySchema);