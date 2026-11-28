import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Story } from '../models/Story';
import { Suspect } from '../models/Suspect';
import { Dialogue } from '../models/Dialogue';
import { dialogues } from './dialogues.data'; 

dotenv.config();

const seedDialogues = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whodunnit404');
        console.log('Connecting to MongoDB to seed dialogues...');

        await Dialogue.deleteMany({});

        const stories = await Story.find();
        const suspects = await Suspect.find();

        const storyMap = new Map<string, mongoose.Types.ObjectId>();
        stories.forEach((s) => storyMap.set(s.title, s._id as mongoose.Types.ObjectId));

        const suspectMap = new Map<string, mongoose.Types.ObjectId>();
        suspects.forEach((s) => suspectMap.set(s.suspect_name, s._id as mongoose.Types.ObjectId));

        const dialogueEntries = [];

        for (const [caseTitle, suspectsDialogues] of Object.entries(dialogues)) {
            const storyId = storyMap.get(caseTitle);
            if (!storyId) {
                console.warn(`Story not found on DB: ${caseTitle}`);
                continue;
            }

            for (const [suspectName, lines] of Object.entries(suspectsDialogues)) {
                const suspectId = suspectMap.get(suspectName);
                if (!suspectId) {
                    console.warn(`Suspect not found on DB: ${suspectName}`);
                    continue;
                }

                dialogueEntries.push({
                    story_id: storyId,
                    suspect_id: suspectId,
                    innocent_lines: lines.innocent,
                    guilty_lines: lines.guilty,
                });
            }
        }

        await Dialogue.insertMany(dialogueEntries);
        console.log(`${dialogueEntries.length} dialogue logs inserted (expected: 27).`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding dialogues:', error);
        process.exit(1);
    }
};

seedDialogues();