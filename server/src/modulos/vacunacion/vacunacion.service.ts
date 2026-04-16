import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearVacunaDto } from './dto/crear-vacuna.dto';

@Injectable()
export class VacunacionService {
    constructor(private prisma: PrismaService) {}

    async listarVacunas() {
        return this.prisma.regVacuna.findMany({
            include: {
                animal: {
                    select: {
                        codigo_local: true,
                        num_ica_chapeta: true,
                        sexo: true,
                        especie: { select: { nombre: true } }
                    }
                },
                vacuna: true,
                responsable: { select: { nombre_completo: true } }
            },
            orderBy: { fecha_aplicacion: 'desc' }
        });
    }

    async crearVacuna(datos: CrearVacunaDto) {
        // Buscar o crear la vacuna en el catálogo
        let vacuna = await this.prisma.catVacunas.findFirst({
            where: { nombre_vacuna: datos.tipo_vacuna }
        });

        if (!vacuna) {
            vacuna = await this.prisma.catVacunas.create({
                data: { nombre_vacuna: datos.tipo_vacuna }
            });
        }

        // Crear registro de vacunación
        return this.prisma.regVacuna.create({
            data: {
                id_animal: datos.id_animal,
                id_vacuna: vacuna.id_vacuna,
                id_responsable: 5, // ID del admin (temporal)
                fecha_aplicacion: new Date(datos.fecha_aplicacion),
                dosis: datos.dosis,
                lote_vacuna: datos.lote_vacuna,
                observaciones: datos.observaciones
            }
        });
    }
}