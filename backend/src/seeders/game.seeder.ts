import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Story } from '../models/Story';
import { Suspect } from '../models/Suspect';
import { Place } from '../models/Place';
import { Weapon } from '../models/Weapon';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whodunnit404');
        console.log('Connecting to MongoDB to seed data...');

        // Clean previos collections
        await Story.deleteMany({});
        await Suspect.deleteMany({});
        await Place.deleteMany({});
        await Weapon.deleteMany({});

        // Insert the 6 available weapons
        const weapons = await Weapon.insertMany([
            { 
                weapon_name: 'Destornillador',
                description: 'Herramienta punzante con punta de metal',
                img_url: '/',
            },
            { 
                weapon_name: 'Bastón',
                description: 'Bastón de madera reforzada con punta de metal',
                img_url: '/',
            },
            { 
                weapon_name: 'Veneno', 
                description: 'Frasco de vidiro con sustancia tóxica onodora',
                img_url: '/',
            },
            { 
                weapon_name: 'Cuchillo' ,
                description: 'Hoja afilada de acero inoxidable',
                img_url: '/',
            },
            { 
                weapon_name: 'Roca' ,
                description: 'Piedra pesadoa con bordes irregulares',
                img_url: '/',
            },
            { 
                weapon_name: 'Cuerda', 
                description: 'Cuerda de fibra gruesa y resistente',
                img_url: '/',
            },
        ]);

        // Auxiliary map for easily linking the fixed weapon for each case
        const weaponMap = new Map<string, mongoose.Types.ObjectId>();
        weapons.forEach((w) => weaponMap.set(w.weapon_name, w._id as mongoose.Types.ObjectId));


        const places = await Place.insertMany([
            { 
                place_name: 'Teatro', 
                zone_info: 'Escenario principal', 
                image_url: '/',
            },
            { 
                place_name: 'Cantina', 
                zone_info: 'Establecimiento ruidoso con olro a licor',
                image_url: '/',
            },
            { 
                place_name: 'Biblioteca', 
                zone_info: 'Estantes repletos de libros antiguos', 
                image_url: '/',
            },
            { 
                place_name: 'Hotel', 
                zone_info: 'Hospedaje elegante con flujo constante de huéspedes',
                image_url: '/',
            },
            { 
                place_name: 'Plaza', 
                zone_info: 'Centro de la ciudad y punto de encuentro concurrido',
                image_url: '/',
            },
            { 
                place_name: 'Salón de baile', 
                zone_info: 'Amplia pista de baile con suelo reluciente',
                image_url: '/',
            },
            { 
                place_name: 'Farmacia', 
                zone_info: 'Estantes con frascos medicinales y tónicos',
                image_url: '/',
            },
            { 
                place_name: 'Café', 
                zone_info: 'Punto de reunión causla con aroma a grano recién tostado',
                image_url: '/',
            },
            { 
                place_name: 'Fachada del banco', 
                zone_info: 'Explanada con columnas altas y la puerta del banco de fondo',
                image_url: '/',
            },
        ]);

        const suspects = await Suspect.insertMany([
            { 
                suspect_name: 'James Moriarty', 
                bio: 'l',
                img_url: '/',
            },
            { 
                suspect_name: 'Irene Norton', 
                bio: 'l', 
                img_url: '/',
            },
            { 
                suspect_name: 'Sebastian Moran', 
                bio: 'l',
                img_url: '/',
            },
            { 
                suspect_name: 'Lawrance Wargfave',  
                bio: 'l',
                img_url: '/',
            },
            { 
                suspect_name: 'Lanfranco Casseti',  
                bio: 'l',
                img_url: '/',
            },
            { 
                suspect_name: 'Vania Lancaster',  
                bio: 'l',
                img_url: '/',
            },
            { 
                suspect_name: 'Willem O´Brien',  
                bio: 'l',
                img_url: '/',
            },
            { 
                suspect_name: 'Amalia Marcel',  
                bio: 'l',
                img_url: '/',
            },
            { 
                suspect_name: 'Isabella Marcell',  
                bio: 'l',
                img_url: '/',
            },
        ]);

        // Insert the three base cases 
        await Story.insertMany([
            {
                title: 'Caso 1',
                intro_text:
                'Descripción del estaod del cuerpo e información sobre el lugar donde lo localizaron',
                victim_name: 'Samuel Ratchett',
                fixed_weapon_id: weaponMap.get('Destornillador'),
            },
            {
                title: 'Caso 2',
                intro_text:
                'Descripción del estaod del cuerpo e información sobre el lugar donde lo localizaron',
                victim_name: 'Linnet Ridgeway',
                fixed_weapon_id: weaponMap.get('Bastón'),
            },
            {
                title: 'Caso 3',
                intro_text:
                'Descripción del estaod del cuerpo e información sobre el lugar donde lo localizaron',
                victim_name: 'Marie Roget',
                fixed_weapon_id: weaponMap.get('Veneno'),
            }, 
        ]);

        console.log('Succesful database seeding');
        process.exit(0);

    } catch (error) {
        console.error('Error while seeding the data: ', error);
        process.exit(1);
    }
}

seedDatabase();