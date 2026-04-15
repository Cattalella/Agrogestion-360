// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Crear Roles
  const rolDueno = await prisma.rol.upsert({
    where: { nombre_rol: 'Dueño' },
    update: {},
    create: { nombre_rol: 'Dueño' },
  });

  const rolAdmin = await prisma.rol.upsert({
    where: { nombre_rol: 'Administrador' },
    update: {},
    create: { nombre_rol: 'Administrador' },
  });

  console.log('✅ Roles creados');

  // 2. Crear Tipo de Documento
  const tipoDoc = await prisma.catalogoDoc.upsert({
    where: { id_tipo_doc: 1 },
    update: {},
    create: { nombre_tipo: 'CC' },
  });

  console.log('✅ Tipo de documento creado');

  // 3. Crear Estado Activo
  const estadoActivo = await prisma.estadoPers.upsert({
    where: { id_estado: 1 },
    update: {},
    create: { nombre: 'Activo' },
  });

  console.log('✅ Estado creado');

  // 4. Crear Dueño (Boss)
  const hashDueno = await bcrypt.hash('clave123', 10);
  await prisma.persona.upsert({
    where: { email: 'boss@agro.com' },
    update: {},
    create: {
      nombre_completo: 'Cesar Boss',
      num_documento: '987654321',
      email: 'boss@agro.com',
      telefono: '3009876543',
      nombre_usuario: 'boss_root',
      contrasena_hash: hashDueno,
      id_rol: rolDueno.id_rol,
      id_tipo_doc: tipoDoc.id_tipo_doc,
      id_estado: estadoActivo.id_estado,
    },
  });

  console.log('✅ Dueño creado: boss_root / clave123');

  // 5. 🆕 Crear Administrador de prueba
  const hashAdmin = await bcrypt.hash('admin123', 10);
  await prisma.persona.upsert({
    where: { email: 'admin@agro.com' },
    update: {},
    create: {
      nombre_completo: 'Administrador Prueba',
      num_documento: '123456789',
      email: 'admin@agro.com',
      telefono: '3001234567',
      nombre_usuario: 'admin_prueba',
      contrasena_hash: hashAdmin,
      id_rol: rolAdmin.id_rol,
      id_tipo_doc: tipoDoc.id_tipo_doc,
      id_estado: estadoActivo.id_estado,
    },
  });

  console.log('✅ Administrador creado: admin_prueba / admin123');
  console.log('');
  console.log('📋 CREDENCIALES:');
  console.log('   Dueño:  boss_root / clave123');
  console.log('   Admin:  admin_prueba / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });