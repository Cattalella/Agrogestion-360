import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditoriaService {
  constructor(private prisma: PrismaService) {}

  async registrar(datos: {
    id_usuario: number;
    accion: string;
    descripcion: string;
    entidad: string;
    id_entidad?: number;
    rol: string;
  }) {
    try {
      // Verificar si el usuario existe antes de crear la auditoría
      const usuarioExiste = await this.prisma.persona.findUnique({
        where: { id_persona: datos.id_usuario }
      });

      if (!usuarioExiste) {
        console.warn(`⚠️ Usuario con id ${datos.id_usuario} no encontrado. Auditoría no registrada.`);
        return null;
      }

      return await this.prisma.auditoria.create({
        data: {
          id_usuario: datos.id_usuario,
          accion: datos.accion,
          descripcion: datos.descripcion,
          entidad: datos.entidad,
          id_entidad: datos.id_entidad,
          rol: datos.rol,
          fecha: new Date(),
        },
      });
    } catch (error) {
      console.error('❌ Error al registrar auditoría:', error);
      // No lanzamos error para no bloquear la acción principal
      return null;
    }
  }

  async listarRecientes() {
    return this.prisma.auditoria.findMany({
      include: {
        Persona: {
          select: { nombre_completo: true }
        }
      },
      orderBy: { fecha: 'desc' },
      take: 100
    });
  }
}