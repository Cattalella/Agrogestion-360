import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VacunacionService {
    constructor(private prisma: PrismaService) {}

    async listarVacunas() {
        const vacunas = await this.prisma.regVacuna.findMany({
            include: {
                animal: {
                    select: {
                        codigo_local: true,
                        num_ica_chapeta: true,
                        sexo: true,
                        especie: { select: { nombre: true } }
                    }
                },
                vacuna: {
                    select: {
                        nombre_vacuna: true
                    }
                },
                responsable: {
                    select: {
                        nombre_completo: true,
                        rol: { select: { nombre_rol: true } }
                    }
                },
                admin: {
                    select: {
                        nombre_completo: true
                    }
                }
            },
            orderBy: { fecha_aplicacion: 'desc' }
        });

        return vacunas.map(v => ({
            id_reg_vac: v.id_reg_vac,
            id_animal: v.id_animal,
            tipo_vacuna: v.vacuna?.nombre_vacuna || 'No especificada',
            fecha_aplicacion: v.fecha_aplicacion,
            dosis: v.dosis,
            lote_vacuna: v.lote_vacuna,
            proximo_refuerzo: v.proximo_refuerzo,
            observaciones: v.observaciones,
            veterinario: (v as any).veterinario || 'No registrado',
            admin_nombre: v.admin?.nombre_completo || 'No registrado',
            admin_id: (v as any).id_admin,
            animal: {
                codigo_local: v.animal?.codigo_local,
                especie: v.animal?.especie?.nombre
            },
            responsable: v.responsable?.nombre_completo
        }));
    }

    async crearVacuna(datos: any, idAdmin: number) {
        let vacuna = await this.prisma.catVacunas.findFirst({
            where: { nombre_vacuna: datos.tipo_vacuna }
        });

        if (!vacuna) {
            vacuna = await this.prisma.catVacunas.create({
                data: { nombre_vacuna: datos.tipo_vacuna }
            });
        }

        const dataToCreate: any = {
            id_animal: datos.id_animal,
            id_vacuna: vacuna.id_vacuna,
            id_responsable: datos.id_responsable || idAdmin,
            fecha_aplicacion: new Date(datos.fecha_aplicacion),
            dosis: datos.dosis || null,
            lote_vacuna: datos.lote_vacuna || null,
            observaciones: datos.observaciones || null,
            proximo_refuerzo: datos.proximo_refuerzo ? new Date(datos.proximo_refuerzo) : null,
            id_admin: idAdmin,
            veterinario: datos.veterinario || null
        };

        const nuevaVacuna = await this.prisma.regVacuna.create({
            data: dataToCreate
        });

        const animal = await this.prisma.animal.findUnique({
            where: { id_animal: nuevaVacuna.id_animal },
            select: { codigo_local: true }
        });
        const catVacuna = await this.prisma.catVacunas.findUnique({
            where: { id_vacuna: nuevaVacuna.id_vacuna }
        });
        const responsable = await this.prisma.persona.findUnique({
            where: { id_persona: nuevaVacuna.id_responsable },
            select: { nombre_completo: true }
        });
        const admin = await this.prisma.persona.findUnique({
            where: { id_persona: idAdmin },
            select: { nombre_completo: true }
        });

        return {
            mensaje: 'Vacuna registrada correctamente',
            vacuna: {
                id: nuevaVacuna.id_reg_vac,
                animal: animal?.codigo_local,
                tipo_vacuna: catVacuna?.nombre_vacuna,
                fecha_aplicacion: nuevaVacuna.fecha_aplicacion,
                dosis: nuevaVacuna.dosis,
                veterinario: datos.veterinario || responsable?.nombre_completo,
                admin_nombre: admin?.nombre_completo || 'No registrado'
            }
        };
    }

    async actualizarVacuna(id: number, datos: any) {
        const vacunaExistente = await this.prisma.regVacuna.findUnique({
            where: { id_reg_vac: id }
        });

        if (!vacunaExistente) {
            throw new NotFoundException('Vacuna no encontrada');
        }

        let idVacuna = vacunaExistente.id_vacuna;
        if (datos.tipo_vacuna) {
            let catVacuna = await this.prisma.catVacunas.findFirst({
                where: { nombre_vacuna: datos.tipo_vacuna }
            });
            if (!catVacuna) {
                catVacuna = await this.prisma.catVacunas.create({
                    data: { nombre_vacuna: datos.tipo_vacuna }
                });
            }
            idVacuna = catVacuna.id_vacuna;
        }

        const dataToUpdate: any = {
            id_animal: datos.id_animal !== undefined ? datos.id_animal : undefined,
            id_vacuna: idVacuna,
            id_responsable: datos.id_responsable !== undefined ? datos.id_responsable : undefined,
            fecha_aplicacion: datos.fecha_aplicacion ? new Date(datos.fecha_aplicacion) : undefined,
            dosis: datos.dosis !== undefined ? datos.dosis : undefined,
            lote_vacuna: datos.lote_vacuna !== undefined ? datos.lote_vacuna : undefined,
            observaciones: datos.observaciones !== undefined ? datos.observaciones : undefined,
            proximo_refuerzo: datos.proximo_refuerzo ? new Date(datos.proximo_refuerzo) : undefined,
            veterinario: datos.veterinario !== undefined ? datos.veterinario : undefined
        };

        const vacunaActualizada = await this.prisma.regVacuna.update({
            where: { id_reg_vac: id },
            data: dataToUpdate
        });

        const animal = await this.prisma.animal.findUnique({
            where: { id_animal: vacunaActualizada.id_animal },
            select: { codigo_local: true }
        });
        const catVacuna = await this.prisma.catVacunas.findUnique({
            where: { id_vacuna: vacunaActualizada.id_vacuna }
        });
        const responsable = await this.prisma.persona.findUnique({
            where: { id_persona: vacunaActualizada.id_responsable },
            select: { nombre_completo: true }
        });

        return {
            mensaje: 'Vacuna actualizada correctamente',
            vacuna: {
                id: vacunaActualizada.id_reg_vac,
                animal: animal?.codigo_local,
                tipo_vacuna: catVacuna?.nombre_vacuna,
                fecha_aplicacion: vacunaActualizada.fecha_aplicacion,
                dosis: vacunaActualizada.dosis,
                veterinario: datos.veterinario || responsable?.nombre_completo
            }
        };
    }

    async eliminarVacuna(id: number) {
        const vacuna = await this.prisma.regVacuna.findUnique({
            where: { id_reg_vac: id }
        });

        if (!vacuna) {
            throw new NotFoundException('Vacuna no encontrada');
        }

        await this.prisma.regVacuna.delete({
            where: { id_reg_vac: id }
        });

        return {
            mensaje: 'Vacuna eliminada correctamente'
        };
    }

    async listarCatalogoVacunas() {
        return this.prisma.catVacunas.findMany({
            orderBy: { nombre_vacuna: 'asc' }
        });
    }
}