import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // 1. Crear el Rol 'Boss'
    const rol = await prisma.rol.upsert({
        where: { nombre_rol: 'Boss' },
        update: {},
        create: { nombre_rol: 'Boss' },
    });

    // 2. Crear el Tipo de Documento 'CC'
    const tipoDoc = await prisma.catalogoDoc.create({
        data: { nombre_tipo: 'CC' }
    });

    // 3. Crear el Estado 'Activo'
    const estado = await prisma.estadoPers.create({
        data: { nombre: 'Activo' }
    });

    // 4. Encriptar la clave
    const hash = await bcrypt.hash('clave123', 10);

    // 5. Crear al Boss (Dueño)
    await prisma.persona.create({
        data: {
            nombre_completo: 'Cesar Boss',
            num_documento: '123456789',
            email: 'boss@agro.com',
            nombre_usuario: 'boss_root',
            contrasena_hash: hash,
            id_rol: rol.id_rol,
            id_tipo_doc: tipoDoc.id_tipo_doc,
            id_estado: estado.id_estado,
        },
    });

    console.log('✅ Boss creado con éxito');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });