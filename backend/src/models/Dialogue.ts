import { Schema, model, Document, Types } from "mongoose";

export interface IDialogue extends Document {
    story_id: Types.ObjectId;
    suspect_id: Types.ObjectId;
    innocent_lines: string[];
    guilty_lines: string[];
}

const DialogueSchema = new Schema<IDialogue>({
    story_id: {
        type: Schema.Types.ObjectId,
        ref: 'Story',
        required: true,
    },
    suspect_id: {
        type: Schema.Types.ObjectId,
        ref:'Suspect',
        required: true,
    },
    innocent_lines: {
        type: [String],
        required: true,
    },
    guilty_lines: {
        type: [String],
        required: true,
    },
});

// Composite index to prevent duplicates and speed up the query
DialogueSchema.index({ story_id: 1, suspect_id: 1, }, { unique:true });

export const Dialogue = model<IDialogue>('Dialogue', DialogueSchema);