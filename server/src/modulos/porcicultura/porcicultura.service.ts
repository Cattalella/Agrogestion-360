import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PorciculturaService {
    constructor(private prisma: PrismaService) {}

    private async obtenerIdEspeciePorcino() {
        let especie = await this.prisma.especie.findFirst({
            where: { nombre: { contains: 'Porcino', mode: 'insensitive' } }
        });

        if (!especie) {
            especie = await this.prisma.especie.findFirst({
                where: { nombre: { contains: 'Cerdo', mode: 'insensitive' } }
            });
        }

        if (!especie) {
            especie = await this.prisma.especie.create({
                data: { nombre: 'Porcino' }
            });
        }

        return especie.id_especie;
    }

    private async obtenerOCrearEstado(nombreEstado: string = 'Activo') {
        let estado = await this.prisma.estadoAni.findFirst({
            where: { nombre: nombreEstado }
        });

        if (!estado) {
            estado = await this.prisma.estadoAni.create({
                data: { nombre: nombreEstado }
            });
        }

        return estado;
    }

    private async obtenerOCrearUbicacion(nombreUbicacion: string = 'Corral 1') {
        let ubicacion = await this.prisma.ubicacion.findFirst({
            where: { nombre_ubi: nombreUbicacion }
        });

        if (!ubicacion) {
            ubicacion = await this.prisma.ubicacion.create({
                data: { nombre_ubi: nombreUbicacion }
            });
        }

        return ubicacion;
    }

    // ============================================================
    // LISTAR CERDOS (NORMALIZADO)
    // ============================================================
    async listarCerdos() {
        const idPorcino = await this.obtenerIdEspeciePorcino();
        const cerdos = await this.prisma.animal.findMany({
            where: { id_especie: idPorcino },
            include: {
                estado: true,
                ubicacion: true
            },
            orderBy: { codigo_local: 'asc' }
        });

        // Normalizar: convertir estado a string como en ganado
        return cerdos.map(cerdo => ({
            id_animal: cerdo.id_animal,
            codigo_local: cerdo.codigo_local,
            local: cerdo.codigo_local,
            num_ica_chapeta: cerdo.num_ica_chapeta,
            oficial: cerdo.num_ica_chapeta,
            sexo: cerdo.sexo === 'M' ? 'MACHO' : 'HEMBRA',
            raza: cerdo.raza,
            fecha_nacimiento: cerdo.fecha_nacimiento,
            peso_actual: cerdo.peso_actual,
            origen: cerdo.origen,
            estado: cerdo.estado?.nombre || 'Activo',
            ubicacion: cerdo.ubicacion?.nombre_ubi || 'Sin ubicación',
            foto_url: cerdo.foto_url,
            createdAt: cerdo.createdAt,
            updatedAt: cerdo.updatedAt
        }));
    }

    // ============================================================
    // REGISTRAR CERDO
    // ============================================================
    async registrarCerdo(datos: any) {
        console.log('📝 Datos recibidos para registrar:', datos);
        
        const idPorcino = await this.obtenerIdEspeciePorcino();

        const existente = await this.prisma.animal.findUnique({
            where: { codigo_local: datos.local }
        });

        if (existente) {
            throw new BadRequestException(`Ya existe un animal con el código local ${datos.local}`);
        }

        let sexoChar = 'F';
        if (datos.sexo === 'MACHO' || datos.sexo === 'M') {
            sexoChar = 'M';
        } else if (datos.sexo === 'HEMBRA' || datos.sexo === 'F') {
            sexoChar = 'F';
        }

        const estadoNombre = datos.salud || 'Activo';
        let estado = await this.prisma.estadoAni.findFirst({
            where: { nombre: estadoNombre }
        });
        
        if (!estado) {
            estado = await this.prisma.estadoAni.create({
                data: { nombre: estadoNombre }
            });
            console.log(`✅ Estado "${estadoNombre}" creado con ID: ${estado.id_estado_ani}`);
        }

        const ubicacionNombre = datos.establo || 'Corral 1';
        let ubicacion = await this.prisma.ubicacion.findFirst({
            where: { nombre_ubi: ubicacionNombre }
        });
        
        if (!ubicacion) {
            ubicacion = await this.prisma.ubicacion.create({
                data: { nombre_ubi: ubicacionNombre }
            });
            console.log(`✅ Ubicación "${ubicacionNombre}" creada con ID: ${ubicacion.id_ubicacion}`);
        }

        const resultado = await this.prisma.animal.create({
            data: {
                codigo_local: datos.local,
                num_ica_chapeta: datos.oficial || null,
                id_especie: idPorcino,
                id_estado_ani: estado.id_estado_ani,
                id_ubicacion: ubicacion.id_ubicacion,
                sexo: sexoChar,
                raza: datos.raza || 'Landrace',
                fecha_nacimiento: datos.nacimiento ? new Date(datos.nacimiento) : new Date(datos.ingreso),
                peso_actual: new Decimal(datos.peso || 0),
                origen: datos.origen || 'Registro Inicial',
                foto_url: datos.foto || null,
                updatedAt: new Date()
            }
        });

        console.log('✅ Cerdo registrado:', resultado);
        return resultado;
    }

    // ============================================================
    // ACTUALIZAR CERDO
    // ============================================================
    async actualizarCerdo(id: number, datos: any) {
        console.log('🔧 Actualizando cerdo ID:', id);
        console.log('🔧 Datos recibidos:', datos);

        const cerdo = await this.prisma.animal.findUnique({
            where: { id_animal: id }
        });

        if (!cerdo) {
            throw new NotFoundException('Cerdo no encontrado');
        }

        const dataActualizar: any = {
            updatedAt: new Date()
        };
        
        if (datos.local !== undefined) dataActualizar.codigo_local = datos.local;
        if (datos.oficial !== undefined) dataActualizar.num_ica_chapeta = datos.oficial;
        if (datos.sexo !== undefined) dataActualizar.sexo = datos.sexo === 'HEMBRA' ? 'F' : 'M';
        if (datos.raza !== undefined) dataActualizar.raza = datos.raza;
        if (datos.nacimiento !== undefined) dataActualizar.fecha_nacimiento = new Date(datos.nacimiento);
        if (datos.peso !== undefined) dataActualizar.peso_actual = new Decimal(datos.peso);
        if (datos.origen !== undefined) dataActualizar.origen = datos.origen;
        
        if (datos.establo !== undefined) {
            const ubicacion = await this.obtenerOCrearUbicacion(datos.establo);
            dataActualizar.id_ubicacion = ubicacion.id_ubicacion;
        }
        
        if (datos.salud !== undefined) {
            const estado = await this.obtenerOCrearEstado(datos.salud);
            dataActualizar.id_estado_ani = estado.id_estado_ani;
        }

        console.log('📝 Data a actualizar:', dataActualizar);

        const resultado = await this.prisma.animal.update({
            where: { id_animal: id },
            data: dataActualizar,
        });

        console.log('✅ Cerdo actualizado:', resultado);
        return resultado;
    }

    // ============================================================
    // ELIMINAR CERDO
    // ============================================================
    async eliminarCerdo(id: number) {
        const cerdo = await this.prisma.animal.findUnique({
            where: { id_animal: id }
        });

        if (!cerdo) {
            throw new NotFoundException('Cerdo no encontrado');
        }

        await this.prisma.venta.deleteMany({ where: { id_animal: id } });
        await this.prisma.regVacuna.deleteMany({ where: { id_animal: id } });
        await this.prisma.historialPeso.deleteMany({ where: { id_animal: id } });

        return this.prisma.animal.delete({
            where: { id_animal: id }
        });
    }
}