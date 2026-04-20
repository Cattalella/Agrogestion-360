import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdministradoresService {
    constructor(private prisma: PrismaService) {}

    async listarActivos() {
        const personas = await this.prisma.persona.findMany({
            where: {
                id_estado: 1,
                rol: { nombre_rol: { in: ['Administrador'] } }
            },
            select: {
                id_persona: true,
                nombre_completo: true,
                rol: { select: { nombre_rol: true } }
            }
        });
        return personas.map(p => ({
            id: p.id_persona,
            nombre: p.nombre_completo,
            rol: p.rol.nombre_rol
        }));
    }

    async listarRevocados() {
        const personas = await this.prisma.persona.findMany({
            where: {
                id_estado: 2,
                rol: { nombre_rol: { in: ['Administrador'] } }
            },
            select: {
                id_persona: true,
                nombre_completo: true,
                rol: { select: { nombre_rol: true } }
            }
        });
        return personas.map(p => ({
            id: p.id_persona,
            nombre: p.nombre_completo,
            rol: p.rol.nombre_rol
        }));
    }

    async registrar(datos: any) {
        const existente = await this.prisma.persona.findUnique({
            where: { email: datos.email }
        });
        if (existente) throw new ConflictException('El correo ya está registrado');

        const rol = await this.prisma.rol.findFirst({
            where: { nombre_rol: datos.rol }
        });
        if (!rol) throw new NotFoundException('Rol no encontrado');

        const tipoDoc = await this.prisma.catalogoDoc.findFirst({
            where: { nombre_tipo: datos.tipo_documento }
        });
        if (!tipoDoc) throw new NotFoundException('Tipo de documento no encontrado');

        const hash = await bcrypt.hash(datos.contrasena, 10);

        const nueva = await this.prisma.persona.create({
            data: {
                nombre_completo: datos.nombre_completo,
                email: datos.email,
                telefono: datos.telefono || null,
                nombre_usuario: datos.nombre_usuario,
                contrasena_hash: hash,
                num_documento: datos.num_documento,
                id_rol: rol.id_rol,
                id_tipo_doc: tipoDoc.id_tipo_doc,
                id_estado: 1
            }
        });
        return { mensaje: 'Administrador registrado correctamente', id: nueva.id_persona };
    }

    async inhabilitar(id: number) {
        const persona = await this.prisma.persona.findUnique({ where: { id_persona: id } });
        if (!persona) throw new NotFoundException('Administrador no encontrado');
        await this.prisma.persona.update({
            where: { id_persona: id },
            data: { id_estado: 2 }
        });
        return { mensaje: 'Administrador inhabilitado' };
    }

    async habilitar(id: number) {
        const persona = await this.prisma.persona.findUnique({ where: { id_persona: id } });
        if (!persona) throw new NotFoundException('Administrador no encontrado');
        await this.prisma.persona.update({
            where: { id_persona: id },
            data: { id_estado: 1 }
        });
        return { mensaje: 'Administrador habilitado' };
    }
}