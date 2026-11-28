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
                zone_info: 'Establecimiento ruidoso con olor a licor',
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
                zone_info: 'Punto de reunión casual con aroma a grano recién tostado',
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
                bio: 'Exprofesor y asesor financiero de mente brillante, con contactos en los bajos fondos. Nadie recuerda haberlo visto perder una discusión.',
                img_url: '/',
            },
            { 
                suspect_name: 'Irene Norton', 
                bio: 'Cantante de ópera y anfitriona de los salones más exclusivos de la ciudad. Sabe más secretos de los que confiesa.', 
                img_url: '/',
            },
            { 
                suspect_name: 'Sebastian Moran', 
                bio: 'Excoronel y cazador experto, ahora trabaja como guardaespaldas por encargo. Es de pocas palabras y excelente puntería.',
                img_url: '/',
            },
            { 
                suspect_name: 'Lawrence Wargrave',  
                bio: 'Juez retirado de reputación severa e impecable. Administra los bienes de varias familias de la ciudad.',
                img_url: '/',
            },
            { 
                suspect_name: 'Lanfranco Casseti',  
                bio: 'Importador de antigüedades con un pasado poco claro. Cambia de socios con la misma facilidad que de dirección.',
                img_url: '/',
            },
            { 
                suspect_name: 'Vania Lancaster',  
                bio: 'Arquitecta y contratista de obras, respetada y muy reservada. Ha trabajado para casi todos los ricos de la ciudad.',
                img_url: '/',
            },
            { 
                suspect_name: 'Willem O´Brien',  
                bio: 'Joven abogado, amable y meticuloso. Aún lo consultan en casos delicados. Es aficionado de la literatura médica',
                img_url: '/',
            },
            { 
                suspect_name: 'Amalia Marcel',  
                bio: 'Contadora de carácter sereno que lleva las cuentas de medio vecindario. Es hermana de Isabella.',
                img_url: '/',
            },
            { 
                suspect_name: 'Isabella Marcel',  
                bio: 'Joyera sociable y de lengua rápida, conocida por saber todos los chismes del barrio. Es hermana de Amalia.',
                img_url: '/',
            },
        ]);

        // Insert the three base cases 
        await Story.insertMany([
            {
                title: 'El ultimo lienzo',
                intro_text:
                'Samuel Ratchett, comerciante de arte de 60 años, fue hallado a una cuadra de su almacén con una herida punzante profunda de bordes irregulares detrás de la oreja izquierda y fractura craneal. Murió desangrado. Las marcas en sus zapatos indican que lo arrastraron desde el lugar del ataque. No se halló el arma y todas las obras que resguardaba desaparecieron.',
                victim_name: 'Samuel Ratchett',
                fixed_weapon_id: weaponMap.get('Destornillador'),
            },
            {
                title: 'La ultima casa',
                intro_text:
                'Linnet Ridgeway, de 20 años, compraba y remodelaba inmuebles para venderlos. Su cuerpo apareció dentro de un baúl de equipaje en un barco rumbo a Egipto, con signos de forcejeo, un golpe contundente en la sien y una marca alargada y cilíndrica de presión en el cuello. La suciedad de su vestido indica que fue arrastrada hasta el baúl. Su empresa había estafado a varias personas para quedarse con sus casas a bajo precio.',
                victim_name: 'Linnet Ridgeway',
                fixed_weapon_id: weaponMap.get('Bastón'),
            },
            {
                title: 'Fragancia a muerte',
                intro_text:
                'Marie Roget, dependienta de perfumería de 22 años, fue hallada a orillas del río, a dos pueblos de su ciudad natal. Su cuerpo tiene múltiples hematomas y marcas en las muñecas, y los labios amoratados. Una carretilla cercana indica que fue transportada y arrojada al agua.',
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