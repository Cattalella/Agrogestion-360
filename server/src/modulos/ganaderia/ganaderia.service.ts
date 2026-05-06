import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearAnimalDto } from './dto/crear-animal.dto';
import { ActualizarAnimalDto } from './dto/actualizar-animal.dto';

@Injectable()
export class GanaderiaService {
    constructor(private prisma: PrismaService) {}

    // ============================================================
    // OBTENER ID DE ESPECIE BOVINA
    // ============================================================
    private async obtenerIdEspecieBovina() {
        let especie = await this.prisma.especie.findFirst({
            where: { nombre: { contains: 'Bovino', mode: 'insensitive' } }
        });

        if (!especie) {
            especie = await this.prisma.especie.create({
                data: { nombre: 'Bovino' }
            });
            console.log('✅ Especie Bovino creada automáticamente');
        }

        return especie.id_especie;
    }

    // ============================================================
    // OBTENER TODOS LOS ANIMALES (SOLO BOVINOS)
    // ============================================================
    async obtenerTodos() {
        const idBovino = await this.obtenerIdEspecieBovina();
        
        const animales = await this.prisma.animal.findMany({
            where: { id_especie: idBovino },
            include: {
                especie: true,
                estado: true,
                ubicacion: true,
            },
            orderBy: { id_animal: 'desc' }
        });

        return animales.map(a => ({
            id: a.id_animal,
            oficial: a.num_ica_chapeta,
            local: a.codigo_local,
            sexo: a.sexo === 'M' ? 'MACHO' : 'HEMBRA',
            raza: a.raza,
            fecha_nacimiento: a.fecha_nacimiento,
            peso_actual: a.peso_actual,
            origen: a.origen,
            estado: a.estado?.nombre === 'Activo' ? 'Sano' : (a.estado?.nombre || 'Sano'),
            ubicacion: a.ubicacion?.nombre_ubi || 'Sin ubicación',
            foto_url: a.foto_url,
        }));
    }

    // ============================================================
    // OBTENER UN ANIMAL POR ID
    // ============================================================
    async obtenerPorId(id: number) {
        const animal = await this.prisma.animal.findUnique({
            where: { id_animal: id },
            include: {
                especie: true,
                estado: true,
                ubicacion: true,
                pesajes: true,
                vacunas: {
                    include: {
                        vacuna: true,
                        responsable: true,
                    }
                }
            }
        });

        if (!animal) {
            throw new NotFoundException('Animal no encontrado');
        }

        return {
            id: animal.id_animal,
            oficial: animal.num_ica_chapeta,
            local: animal.codigo_local,
            sexo: animal.sexo === 'M' ? 'MACHO' : 'HEMBRA',
            raza: animal.raza,
            fecha_nacimiento: animal.fecha_nacimiento,
            peso_actual: animal.peso_actual,
            origen: animal.origen,
            estado: animal.estado?.nombre === 'Activo' ? 'Sano' : (animal.estado?.nombre || 'Sano'),
            ubicacion: animal.ubicacion?.nombre_ubi || 'Sin ubicación',
            foto_url: animal.foto_url,
            pesajes: animal.pesajes,
            vacunas: animal.vacunas.map(v => ({
                id: v.id_reg_vac,
                vacuna: v.vacuna.nombre_vacuna,
                fecha: v.fecha_aplicacion,
                responsable: v.responsable.nombre_completo,
            }))
        };
    }

    // ============================================================
    // MÉTODOS AUXILIARES
    // ============================================================
    private async obtenerOCrearEspecie(nombreEspecie: string = 'Bovino') {
        let especie = await this.prisma.especie.findFirst({
            where: { nombre: nombreEspecie }
        });

        if (!especie) {
            especie = await this.prisma.especie.create({
                data: { nombre: nombreEspecie }
            });
            console.log(`✅ Especie creada automáticamente: ${nombreEspecie}`);
        }

        return especie;
    }

    private async obtenerOCrearEstado(nombreEstado: string = 'Sano') {
        let estado = await this.prisma.estadoAni.findFirst({
            where: { nombre: nombreEstado }
        });

        if (!estado) {
            estado = await this.prisma.estadoAni.create({
                data: { nombre: nombreEstado }
            });
            console.log(`✅ Estado creado automáticamente: ${nombreEstado}`);
        }

        return estado;
    }

    private async obtenerOCrearUbicacion(nombreUbicacion: string = 'Potrero 1') {
        let ubicacion = await this.prisma.ubicacion.findFirst({
            where: { nombre_ubi: nombreUbicacion }
        });

        if (!ubicacion) {
            ubicacion = await this.prisma.ubicacion.create({
                data: { nombre_ubi: nombreUbicacion }
            });
            console.log(`✅ Ubicación creada automáticamente: ${nombreUbicacion}`);
        }

        return ubicacion;
    }

    // ============================================================
    // CREAR NUEVO ANIMAL
    // ============================================================
    async crear(datos: CrearAnimalDto) {
        const especie = await this.obtenerOCrearEspecie('Bovino');
        let estado = await this.obtenerOCrearEstado('Sano');
        const ubicacion = await this.obtenerOCrearUbicacion('Potrero 1');

        const animal = await this.prisma.animal.create({
            data: {
                num_ica_chapeta: datos.num_ica_chapeta || null,
                codigo_local: datos.codigo_local,
                id_especie: especie.id_especie,
                id_estado_ani: estado.id_estado_ani,
                id_ubicacion: ubicacion.id_ubicacion,
                sexo: datos.sexo === 'HEMBRA' ? 'F' : 'M',
                raza: datos.raza || 'Criollo',
                fecha_nacimiento: new Date(datos.fecha_nacimiento || new Date()),
                peso_actual: datos.peso_actual || 0,
                origen: datos.origen || 'Registro inicial',
                foto_url: datos.foto_url || null,
                updatedAt: new Date(),
            },
            include: {
                especie: true,
                estado: true,
                ubicacion: true,
            }
        });

        if (datos.peso_actual && datos.peso_actual > 0) {
            await this.prisma.historialPeso.create({
                data: {
                    id_animal: animal.id_animal,
                    peso: datos.peso_actual,
                    fecha_pesaje: new Date(),
                }
            });
        }

        console.log(`✅ Animal registrado: ${animal.codigo_local} con estado Sano`);

        return {
            id: animal.id_animal,
            oficial: animal.num_ica_chapeta,
            local: animal.codigo_local,
            sexo: animal.sexo === 'F' ? 'HEMBRA' : 'MACHO',
            raza: animal.raza,
            estado: 'Sano',
            ubicacion: animal.ubicacion?.nombre_ubi || 'Potrero 1',
            mensaje: 'Animal registrado correctamente'
        };
    }

    // ============================================================
    // ACTUALIZAR ANIMAL (CORREGIDO)
    // ============================================================
    async actualizar(id: number, datos: ActualizarAnimalDto) {
        const dataActualizar: any = {
            updatedAt: new Date()
        };
        
        if (datos.num_ica_chapeta !== undefined) dataActualizar.num_ica_chapeta = datos.num_ica_chapeta;
        if (datos.codigo_local !== undefined) dataActualizar.codigo_local = datos.codigo_local;
        if (datos.sexo !== undefined) dataActualizar.sexo = datos.sexo === 'HEMBRA' ? 'F' : datos.sexo === 'MACHO' ? 'M' : undefined;
        if (datos.raza !== undefined) dataActualizar.raza = datos.raza;
        if (datos.fecha_nacimiento !== undefined) dataActualizar.fecha_nacimiento = new Date(datos.fecha_nacimiento);
        if (datos.peso_actual !== undefined) dataActualizar.peso_actual = datos.peso_actual;
        if (datos.origen !== undefined) dataActualizar.origen = datos.origen;
        if (datos.id_ubicacion !== undefined) dataActualizar.id_ubicacion = datos.id_ubicacion;
        if (datos.foto_url !== undefined) dataActualizar.foto_url = datos.foto_url;
        
        // ✅ CORREGIDO: Manejar actualización de estado por nombre (salud)
        if (datos.salud !== undefined && datos.salud !== null) {
            const estadoObj = await this.obtenerOCrearEstado(datos.salud);
            dataActualizar.id_estado_ani = estadoObj.id_estado_ani;
            console.log(`📝 Actualizando estado a: ${datos.salud} (ID: ${estadoObj.id_estado_ani})`);
        }

        console.log('📝 Datos a actualizar:', dataActualizar);

        const animal = await this.prisma.animal.update({
            where: { id_animal: id },
            data: dataActualizar,
            include: { estado: true }
        });

        console.log(`✅ Animal actualizado: ${animal.codigo_local} - Nuevo estado: ${animal.estado?.nombre}`);

        return {
            mensaje: 'Animal actualizado correctamente',
            animal: {
                id: animal.id_animal,
                local: animal.codigo_local,
                estado: animal.estado?.nombre
            }
        };
    }

    // ============================================================
    // ELIMINAR ANIMAL
    // ============================================================
    async eliminar(id: number) {
        const animal = await this.prisma.animal.findUnique({
            where: { id_animal: id }
        });

        if (!animal) {
            throw new NotFoundException('Animal no encontrado');
        }

        console.log(`🗑️ Eliminando animal: ${animal.codigo_local} (ID: ${id})`);

        await this.prisma.historialPeso.deleteMany({
            where: { id_animal: id }
        });

        await this.prisma.regVacuna.deleteMany({
            where: { id_animal: id }
        });

        await this.prisma.venta.deleteMany({
            where: { id_animal: id }
        });

        await this.prisma.animal.delete({
            where: { id_animal: id }
        });

        console.log(`✅ Animal eliminado completamente: ${animal.codigo_local}`);

        return {
            mensaje: 'Animal eliminado correctamente junto con todos sus registros asociados',
            detalles: {
                animal: animal.codigo_local,
            }
        };
    }

    // ============================================================
    // OBTENER CATÁLOGOS
    // ============================================================
    async obtenerCatalogos() {
        const [especies, ubicaciones, estados] = await Promise.all([
            this.prisma.especie.findMany(),
            this.prisma.ubicacion.findMany(),
            this.prisma.estadoAni.findMany(),
        ]);

        return { especies, ubicaciones, estados };
    }
}