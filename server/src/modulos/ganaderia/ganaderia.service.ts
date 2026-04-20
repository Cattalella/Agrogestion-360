// src/modulos/ganaderia/ganaderia.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearAnimalDto } from './dto/crear-animal.dto';
import { ActualizarAnimalDto } from './dto/actualizar-animal.dto';

@Injectable()
export class GanaderiaService {
    constructor(private prisma: PrismaService) {}

    // ============================================================
    // OBTENER TODOS LOS ANIMALES
    // ============================================================
    async obtenerTodos() {
        const animales = await this.prisma.animal.findMany({
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
            estado: a.estado?.nombre || 'Activo',
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
            estado: animal.estado?.nombre || 'Activo',
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
    // MÉTODO AUXILIAR: OBTENER O CREAR ESPECIE
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

    // ============================================================
    // MÉTODO AUXILIAR: OBTENER O CREAR ESTADO
    // ============================================================
    private async obtenerOCrearEstado(nombreEstado: string = 'Activo') {
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

    // ============================================================
    // MÉTODO AUXILIAR: OBTENER O CREAR UBICACIÓN
    // ============================================================
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
        const estado = await this.obtenerOCrearEstado('Activo');
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

        console.log(`✅ Animal registrado: ${animal.codigo_local}`);

        return {
            id: animal.id_animal,
            oficial: animal.num_ica_chapeta,
            local: animal.codigo_local,
            sexo: animal.sexo === 'F' ? 'HEMBRA' : 'MACHO',
            raza: animal.raza,
            estado: animal.estado?.nombre || 'Activo',
            ubicacion: animal.ubicacion?.nombre_ubi || 'Potrero 1',
            mensaje: 'Animal registrado correctamente'
        };
    }

    // ============================================================
    // ACTUALIZAR ANIMAL
    // ============================================================
    async actualizar(id: number, datos: ActualizarAnimalDto) {
        const dataActualizar: any = {};
        
        if (datos.num_ica_chapeta !== undefined) dataActualizar.num_ica_chapeta = datos.num_ica_chapeta;
        if (datos.codigo_local !== undefined) dataActualizar.codigo_local = datos.codigo_local;
        if (datos.sexo !== undefined) dataActualizar.sexo = datos.sexo === 'HEMBRA' ? 'F' : datos.sexo === 'MACHO' ? 'M' : undefined;
        if (datos.raza !== undefined) dataActualizar.raza = datos.raza;
        if (datos.fecha_nacimiento !== undefined) dataActualizar.fecha_nacimiento = new Date(datos.fecha_nacimiento);
        if (datos.peso_actual !== undefined) dataActualizar.peso_actual = datos.peso_actual;
        if (datos.origen !== undefined) dataActualizar.origen = datos.origen;
        if (datos.id_ubicacion !== undefined) dataActualizar.id_ubicacion = datos.id_ubicacion;
        if (datos.id_estado_ani !== undefined) dataActualizar.id_estado_ani = datos.id_estado_ani;
        if (datos.foto_url !== undefined) dataActualizar.foto_url = datos.foto_url;
        
        dataActualizar.updatedAt = new Date();

        const animal = await this.prisma.animal.update({
            where: { id_animal: id },
            data: dataActualizar,
        });

        return {
            mensaje: 'Animal actualizado correctamente',
            animal: {
                id: animal.id_animal,
                local: animal.codigo_local,
            }
        };
    }

    // ============================================================
    // ELIMINAR ANIMAL (CON NOMBRES CORRECTOS DEL SCHEMA)
    // ============================================================
    async eliminar(id: number) {
        // Verificar si el animal existe
        const animal = await this.prisma.animal.findUnique({
            where: { id_animal: id }
        });

        if (!animal) {
            throw new NotFoundException('Animal no encontrado');
        }

        console.log(`🗑️ Eliminando animal: ${animal.codigo_local} (ID: ${id})`);

        // 1. Eliminar registros de HISTORIAL DE PESO (historialPeso)
        const pesosEliminados = await this.prisma.historialPeso.deleteMany({
            where: { id_animal: id }
        });
        console.log(`   - Eliminados ${pesosEliminados.count} registros de peso`);

        // 2. Eliminar registros de VACUNAS (RegVacuna - con R mayúscula)
        const vacunasEliminadas = await this.prisma.regVacuna.deleteMany({
            where: { id_animal: id }
        });
        console.log(`   - Eliminados ${vacunasEliminadas.count} registros de vacunas`);

        // 3. Eliminar registros de VENTAS (Venta - con V mayúscula)
        const ventasEliminadas = await this.prisma.venta.deleteMany({
            where: { id_animal: id }
        });
        console.log(`   - Eliminadas ${ventasEliminadas.count} ventas`);

        // 4. Finalmente eliminar el ANIMAL
        await this.prisma.animal.delete({
            where: { id_animal: id }
        });

        console.log(`✅ Animal eliminado completamente: ${animal.codigo_local}`);

        return {
            mensaje: 'Animal eliminado correctamente junto con todos sus registros asociados',
            detalles: {
                animal: animal.codigo_local,
                pesos_eliminados: pesosEliminados.count,
                vacunas_eliminadas: vacunasEliminadas.count,
                ventas_eliminadas: ventasEliminadas.count,
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