import { Schema, model, Document } from 'mongoose';

export interface IPlace extends Document {
    place_name: string,
    zone_info: string,
    image_url: string
}

const PlaceSchema = new Schema<IPlace> ({
    place_name: {
        type: String,
        required: true
    },
    zone_info: {
        type: String, 
        required: true
    },
    image_url: {
        type: String, 
        required: true
    }
});

export const Place = model<IPlace>('Place', PlaceSchema); 