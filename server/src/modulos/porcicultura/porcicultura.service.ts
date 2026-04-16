import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CrearCerdoDto } from './dto/crear-cerdo.dto';

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

    async listarCerdos() {
        const idPorcino = await this.obtenerIdEspeciePorcino();
        return this.prisma.animal.findMany({
            where: { id_especie: idPorcino },
            include: {
                estado: true,
                ubicacion: true
            },
            orderBy: { codigo_local: 'asc' }
        });
    }

    async registrarCerdo(datos: CrearCerdoDto) {
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

        return this.prisma.animal.create({
            data: {
                codigo_local: datos.local,
                num_ica_chapeta: datos.oficial || null,
                id_especie: idPorcino,
                id_estado_ani: 1,
                id_ubicacion: 1,
                sexo: sexoChar,
                raza: datos.raza || 'Landrace',
                fecha_nacimiento: datos.nacimiento ? new Date(datos.nacimiento) : new Date(datos.ingreso),
                peso_actual: new Decimal(datos.peso || 0),
                origen: datos.origen || 'Registro Inicial',
                foto_url: datos.foto || null,
                updatedAt: new Date()
            }
        });
    }
}