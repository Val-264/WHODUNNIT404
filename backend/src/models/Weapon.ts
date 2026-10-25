import { Schema, model, Document } from 'mongoose';

export interface IWeapon extends Document {
    weapon_name: string, 
    description: string,
    img_url: string
}

const WeaponSchema = new Schema<IWeapon> ({
    weapon_name: {
        type: String, 
        required: true
    }, 
    description: {
        type: String,
        required: true
    }, 
    img_url: {
        type: String, 
        required: true
    }
});

export const Weapon = model<IWeapon>('Weapon', WeaponSchema);