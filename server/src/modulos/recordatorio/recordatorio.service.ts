// src/modulos/recordatorios/recordatorios.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearRecordatorioDto } from './dto/crear-recordatorio.dto';
import { formatearFecha } from '../../compartido/utilidades/fechas.utilidad';

@Injectable()
export class RecordatoriosService {
  constructor(private prisma: PrismaService) {}

  // ============================================================
  // OBTENER TODOS LOS RECORDATORIOS
  // ============================================================
  async obtenerTodos(idUsuario: number) {
    const recordatorios = await this.prisma.recordatorio.findMany({
      where: { id_persona: idUsuario },
      orderBy: { fecha: 'asc' },
    });

    return recordatorios.map((r) => ({
      id: r.id,
      fecha: formatearFecha(r.fecha),
      proposito: r.proposito || 'Sin motivo',
      cumplido: r.cumplido,
      fechaCumplida: r.fecha_cumplida ? formatearFecha(r.fecha_cumplida) : null,
    }));
  }

  // ============================================================
  // CREAR NUEVO RECORDATORIO
  // ============================================================
  async crear(idUsuario: number, datos: CrearRecordatorioDto) {
    const recordatorio = await this.prisma.recordatorio.create({
      data: {
        id_persona: idUsuario,
        fecha: new Date(datos.fecha),
        proposito: datos.proposito || 'Sin motivo',
        cumplido: false,
        updatedAt: new Date(),
      },
    });

    return {
      id: recordatorio.id,
      fecha: formatearFecha(recordatorio.fecha),
      proposito: recordatorio.proposito,
      cumplido: recordatorio.cumplido,
    };
  }

  // ============================================================
  // MARCAR COMO CUMPLIDO
  // ============================================================
  async marcarCumplido(idUsuario: number, idRecordatorio: string) {
    const resultado = await this.prisma.recordatorio.updateMany({
      where: {
        id: idRecordatorio,
        id_persona: idUsuario,
      },
      data: {
        cumplido: true,
        fecha_cumplida: new Date(),
      },
    });

    if (resultado.count === 0) {
      throw new NotFoundException('Recordatorio no encontrado');
    }

    return {
      mensaje: 'Recordatorio marcado como cumplido',
    };
  }

  // ============================================================
  // ELIMINAR RECORDATORIO
  // ============================================================
  async eliminar(idUsuario: number, idRecordatorio: string) {
    const resultado = await this.prisma.recordatorio.deleteMany({
      where: {
        id: idRecordatorio,
        id_persona: idUsuario,
      },
    });

    if (resultado.count === 0) {
      throw new NotFoundException('Recordatorio no encontrado');
    }

    return {
      mensaje: 'Recordatorio eliminado correctamente',
    };
  }

  // ============================================================
  // SINCRONIZAR (Obtener todos - para cuando el usuario inicia sesión)
  // ============================================================
  async sincronizar(idUsuario: number) {
    return this.obtenerTodos(idUsuario);
  }
}