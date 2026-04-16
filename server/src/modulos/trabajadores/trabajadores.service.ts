import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class TrabajadoresService {
  constructor(
    private prisma: PrismaService,
    private auditoria: AuditoriaService
  ) {}

  // ============================================================
  // 📌 GESTIÓN DE TRABAJADORES (RF.8.1.3)
  // ============================================================

  async listarTrabajadores() {
    return this.prisma.trabajador.findMany({
      orderBy: { nombre_completo: 'asc' }
    });
  }

  async crearTrabajador(datos: any) {
    // Validar que no exista un trabajador con el mismo documento
    const existente = await this.prisma.trabajador.findFirst({
      where: {
        tipo_documento: datos.tipo_documento,
        num_documento: datos.num_documento
      }
    });

    if (existente) {
      throw new BadRequestException('Ya existe un trabajador con ese tipo y número de documento');
    }

    return this.prisma.trabajador.create({
      data: {
        nombre_completo: datos.nombre_completo,
        tipo_documento: datos.tipo_documento,
        num_documento: datos.num_documento,
        tipo_trabajo: datos.tipo_trabajo,
        telefono: datos.telefono || null,
        telefono_familiar: datos.telefono_familiar || null,
        direccion: datos.direccion || null,
        estado: datos.estado || 'Activo',
        fecha_ingreso: datos.fecha_ingreso ? new Date(datos.fecha_ingreso) : new Date(),
        observaciones: datos.observaciones || null,
        updatedAt: new Date()
      }
    });
  }

  async actualizarTrabajador(id: number, datos: any) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id_trabajador: id }
    });

    if (!trabajador) {
      throw new NotFoundException('Trabajador no encontrado');
    }

    return this.prisma.trabajador.update({
      where: { id_trabajador: id },
      data: {
        nombre_completo: datos.nombre_completo,
        tipo_documento: datos.tipo_documento,
        num_documento: datos.num_documento,
        tipo_trabajo: datos.tipo_trabajo,
        telefono: datos.telefono,
        telefono_familiar: datos.telefono_familiar,
        direccion: datos.direccion,
        estado: datos.estado,
        fecha_ingreso: datos.fecha_ingreso ? new Date(datos.fecha_ingreso) : undefined,
        observaciones: datos.observaciones,
        updatedAt: new Date()
      }
    });
  }

  async eliminarTrabajador(id: number) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id_trabajador: id }
    });

    if (!trabajador) {
      throw new NotFoundException('Trabajador no encontrado');
    }

    // RM.8.1.3: Borrado lógico para mantener historial
    return this.prisma.trabajador.update({
      where: { id_trabajador: id },
      data: {
        estado: 'Inactivo',
        updatedAt: new Date()
      }
    });
  }

  // ============================================================
  // 📌 REGISTRO DE TRABAJO REALIZADO (RF.8.1.2)
  // ============================================================

  async listarTrabajos() {
    return this.prisma.trabajoRealizado.findMany({
      include: {
        Trabajador: {
          select: { nombre_completo: true }
        }
      },
      orderBy: { fecha_inicio: 'desc' }
    });
  }

  async registrarTrabajo(datos: any) {
    // Validar que el trabajador esté activo
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id_trabajador: parseInt(datos.id_trabajador) }
    });

    if (!trabajador || trabajador.estado !== 'Activo') {
      throw new BadRequestException('Solo trabajadores activos pueden registrar trabajo');
    }

    // Calcular duración si no viene explícita (en horas)
    let duracion = datos.duracion_horas;
    if (!duracion && datos.fecha_inicio && datos.fecha_fin) {
      const inicio = new Date(datos.fecha_inicio);
      const fin = new Date(datos.fecha_fin);
      duracion = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    }

    return this.prisma.trabajoRealizado.create({
      data: {
        id_trabajador: parseInt(datos.id_trabajador),
        categoria_trabajo: datos.categoria_trabajo,
        tipo_actividad: datos.tipo_actividad,
        fecha_inicio: new Date(datos.fecha_inicio),
        fecha_fin: new Date(datos.fecha_fin),
        duracion_horas: new Decimal(duracion || 0),
        evidencia_url: datos.evidencia_url || datos.evidencia_fotografica || '',
        observaciones: datos.observaciones || null,
        updatedAt: new Date()
      }
    });
  }

  // ============================================================
  // 📌 REGISTRO DE PAGOS A TRABAJADORES (RF.8.1.1)
  // ============================================================

  async listarPagos() {
    return this.prisma.pagoTrabajador.findMany({
      include: {
        Trabajador: {
          select: { nombre_completo: true }
        },
        TrabajoRealizado: {
          select: { tipo_actividad: true }
        }
      },
      orderBy: { fecha_pago: 'desc' }
    });
  }

  async registrarPago(datos: any) {
    // Validar que el trabajador exista y esté activo
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id_trabajador: parseInt(datos.id_trabajador) }
    });

    if (!trabajador) {
      throw new BadRequestException('Trabajador no encontrado');
    }

    if (trabajador.estado !== 'Activo') {
      throw new BadRequestException('Solo se puede pagar a trabajadores activos');
    }

    const pago = await this.prisma.pagoTrabajador.create({
      data: {
        id_trabajador: parseInt(datos.id_trabajador),
        id_trabajo: datos.id_trabajo ? parseInt(datos.id_trabajo) : null,
        fecha_pago: new Date(datos.fecha_pago),
        monto_total: new Decimal(datos.monto_total),
        concepto: datos.concepto,
        estado_pago: datos.estado || 'No pagado',  // 🆕 CORREGIDO
        firma_url: datos.firma_url || null,
        updatedAt: new Date()
      },
      include: {
        Trabajador: {
          select: { nombre_completo: true }
        }
      }
    });

    // Registrar en auditoría
    await this.auditoria.registrar({
      id_usuario: datos.id_usuario_actual || 5, // ID del admin
      accion: 'REGISTRO_PAGO',
      descripcion: `Pago registrado para ${trabajador.nombre_completo} por $${datos.monto_total}`,
      entidad: 'PagoTrabajador',
      id_entidad: pago.id_pago,
      rol: 'Administrador'
    });

    return pago;
  }

  async obtenerPago(id: number) {
    const pago = await this.prisma.pagoTrabajador.findUnique({
      where: { id_pago: id },
      include: {
        Trabajador: {
          select: { nombre_completo: true }
        }
      }
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    return pago;
  }

  async anularPago(id: number, justificacion: string) {
    const pago = await this.prisma.pagoTrabajador.findUnique({
      where: { id_pago: id }
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (pago.estado_pago === 'Anulado') {
      throw new BadRequestException('El pago ya está anulado');
    }

    const pagoAnulado = await this.prisma.pagoTrabajador.update({
      where: { id_pago: id },
      data: {
        estado_pago: 'Anulado',
        justificacion_anulacion: justificacion,
        updatedAt: new Date()
      }
    });

    // Registrar en auditoría
    await this.auditoria.registrar({
      id_usuario: 5, // ID del admin
      accion: 'ANULACION_PAGO',
      descripcion: `Pago #${id} anulado. Justificación: ${justificacion}`,
      entidad: 'PagoTrabajador',
      id_entidad: id,
      rol: 'Administrador'
    });

    return pagoAnulado;
  }

  // ============================================================
  // 📌 OBTENER PAGOS PENDIENTES DE FIRMA
  // ============================================================
  async obtenerPagosPendientes() {
    return this.prisma.pagoTrabajador.findMany({
      where: {
        estado_pago: 'Pendiente de firma'
      },
      include: {
        Trabajador: {
          select: { nombre_completo: true }
        }
      },
      orderBy: { fecha_pago: 'asc' }
    });
  }

  // ============================================================
  // 📌 CONFIRMAR PAGO CON FIRMA
  // ============================================================
  async confirmarPagoConFirma(id: number, firma_url: string) {
    const pago = await this.prisma.pagoTrabajador.findUnique({
      where: { id_pago: id }
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    return this.prisma.pagoTrabajador.update({
      where: { id_pago: id },
      data: {
        estado_pago: 'Pagado con firma',
        firma_url: firma_url,
        updatedAt: new Date()
      }
    });
  }
}