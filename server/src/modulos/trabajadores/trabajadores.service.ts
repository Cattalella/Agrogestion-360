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
    const existente = await this.prisma.trabajador.findFirst({
      where: {
        tipo_documento: datos.tipo_documento,
        num_documento: datos.num_documento
      }
    });

    if (existente) {
      throw new BadRequestException('Ya existe un trabajador con ese tipo y número de documento');
    }

    // Normalizar estado a minúscula
    const estadoNormalizado = datos.estado?.toLowerCase() === 'activo' ? 'activo' : 'inactivo';

    return this.prisma.trabajador.create({
      data: {
        nombre_completo: datos.nombre_completo,
        tipo_documento: datos.tipo_documento,
        num_documento: datos.num_documento,
        tipo_trabajo: datos.tipo_trabajo,
        telefono: datos.telefono || null,
        telefono_familiar: datos.telefono_familiar || null,
        direccion: datos.direccion || null,
        estado: estadoNormalizado,
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

    // Normalizar estado a minúscula si viene
    let estadoNormalizado = datos.estado;
    if (estadoNormalizado) {
      estadoNormalizado = estadoNormalizado.toLowerCase() === 'activo' ? 'activo' : 'inactivo';
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
        estado: estadoNormalizado,
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

    return this.prisma.trabajador.update({
      where: { id_trabajador: id },
      data: {
        estado: 'inactivo',
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
          select: { nombre_completo: true, id_trabajador: true }
        }
      },
      orderBy: { fecha_inicio: 'desc' }
    });
  }

  async registrarTrabajo(datos: any) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id_trabajador: parseInt(datos.id_trabajador) }
    });

    // Validar trabajador activo (acepta 'activo' y 'Activo')
    if (!trabajador || trabajador.estado.toLowerCase() !== 'activo') {
      throw new BadRequestException('Solo trabajadores activos pueden registrar trabajo');
    }

    if (!datos.evidencia_url) {
      throw new BadRequestException('La evidencia fotográfica es obligatoria');
    }

    let duracion = datos.duracion_horas;
    if (!duracion && datos.fecha_inicio && datos.fecha_fin) {
      const inicio = new Date(datos.fecha_inicio);
      const fin = new Date(datos.fecha_fin);
      duracion = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    }

    if (duracion <= 0) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    return this.prisma.trabajoRealizado.create({
      data: {
        id_trabajador: parseInt(datos.id_trabajador),
        categoria_trabajo: datos.categoria_trabajo,
        tipo_actividad: datos.tipo_actividad,
        fecha_inicio: new Date(datos.fecha_inicio),
        fecha_fin: new Date(datos.fecha_fin),
        duracion_horas: new Decimal(duracion),
        evidencia_url: datos.evidencia_url,
        observaciones: datos.observaciones || null,
        updatedAt: new Date()
      },
      include: {
        Trabajador: { select: { nombre_completo: true, id_trabajador: true } }
      }
    });
  }

  async actualizarTrabajo(id: number, datos: any) {
    const trabajo = await this.prisma.trabajoRealizado.findUnique({
      where: { id_trabajo: id }
    });

    if (!trabajo) {
      throw new NotFoundException('Trabajo no encontrado');
    }

    let duracion = datos.duracion_horas;
    if (!duracion && datos.fecha_inicio && datos.fecha_fin) {
      const inicio = new Date(datos.fecha_inicio);
      const fin = new Date(datos.fecha_fin);
      duracion = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    }

    return this.prisma.trabajoRealizado.update({
      where: { id_trabajo: id },
      data: {
        categoria_trabajo: datos.categoria_trabajo ?? undefined,
        tipo_actividad: datos.tipo_actividad ?? undefined,
        fecha_inicio: datos.fecha_inicio ? new Date(datos.fecha_inicio) : undefined,
        fecha_fin: datos.fecha_fin ? new Date(datos.fecha_fin) : undefined,
        duracion_horas: duracion ? new Decimal(duracion) : undefined,
        evidencia_url: datos.evidencia_url ?? undefined,
        observaciones: datos.observaciones ?? undefined,
        updatedAt: new Date()
      },
      include: {
        Trabajador: { select: { nombre_completo: true, id_trabajador: true } }
      }
    });
  }

  async eliminarTrabajo(id: number, justificacion?: string) {
    const trabajo = await this.prisma.trabajoRealizado.findUnique({
      where: { id_trabajo: id }
    });

    if (!trabajo) {
      throw new NotFoundException('Trabajo no encontrado');
    }

    await this.auditoria.registrar({
      id_usuario: 5,
      accion: 'ELIMINACION_TRABAJO',
      descripcion: `Trabajo #${id} eliminado. ${justificacion ? `Justificación: ${justificacion}` : 'Sin justificación'}`,
      entidad: 'TrabajoRealizado',
      id_entidad: id,
      rol: 'Administrador'
    });

    return this.prisma.trabajoRealizado.delete({
      where: { id_trabajo: id }
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
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id_trabajador: parseInt(datos.id_trabajador) }
    });

    if (!trabajador) {
      throw new BadRequestException('Trabajador no encontrado');
    }

    // 🔥 VALIDACIÓN CORREGIDA: acepta 'activo' y 'Activo'
    if (trabajador.estado.toLowerCase() !== 'activo') {
      throw new BadRequestException('Solo se puede pagar a trabajadores activos');
    }

    const pago = await this.prisma.pagoTrabajador.create({
      data: {
        id_trabajador: parseInt(datos.id_trabajador),
        id_trabajo: datos.id_trabajo ? parseInt(datos.id_trabajo) : null,
        fecha_pago: new Date(datos.fecha_pago),
        monto_total: new Decimal(datos.monto_total),
        concepto: datos.concepto,
        estado_pago: datos.estado_pago || 'No pagado',
        firma_url: datos.firma_url || null,
        updatedAt: new Date()
      },
      include: {
        Trabajador: {
          select: { nombre_completo: true }
        }
      }
    });

    await this.auditoria.registrar({
      id_usuario: datos.id_usuario_actual || 5,
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

  async actualizarPago(id: number, datos: any) {
    const pago = await this.prisma.pagoTrabajador.findUnique({
      where: { id_pago: id }
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (pago.estado_pago === 'Anulado' || pago.justificacion_anulacion) {
      throw new BadRequestException('No se puede editar un pago anulado');
    }

    const pagoActualizado = await this.prisma.pagoTrabajador.update({
      where: { id_pago: id },
      data: {
        fecha_pago: datos.fecha_pago ? new Date(datos.fecha_pago) : undefined,
        monto_total: datos.monto_total ? new Decimal(datos.monto_total) : undefined,
        concepto: datos.concepto ?? undefined,
        estado_pago: datos.estado_pago ?? undefined,
        firma_url: datos.firma_url ?? undefined,
        updatedAt: new Date()
      },
      include: {
        Trabajador: { select: { nombre_completo: true } }
      }
    });

    await this.auditoria.registrar({
      id_usuario: datos.id_usuario_actual || 5,
      accion: 'ACTUALIZACION_PAGO',
      descripcion: `Pago #${id} actualizado`,
      entidad: 'PagoTrabajador',
      id_entidad: id,
      rol: 'Administrador'
    });

    return pagoActualizado;
  }

  async anularPago(id: number, justificacion: string) {
    if (!justificacion?.trim()) {
      throw new BadRequestException('La justificación es obligatoria para anular un pago');
    }

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

    await this.auditoria.registrar({
      id_usuario: 5,
      accion: 'ANULACION_PAGO',
      descripcion: `Pago #${id} anulado. Justificación: ${justificacion}`,
      entidad: 'PagoTrabajador',
      id_entidad: id,
      rol: 'Administrador'
    });

    return pagoAnulado;
  }

  async obtenerPagosPendientes() {
    return this.prisma.pagoTrabajador.findMany({
      where: { estado_pago: 'Pendiente de firma' },
      include: {
        Trabajador: { select: { nombre_completo: true } }
      },
      orderBy: { fecha_pago: 'asc' }
    });
  }

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

  // ============================================================
  // 📌 DASHBOARD — SUPERVISIÓN (Hero2)
  // ============================================================

  async contarTrabajadoresActivos(): Promise<number> {
    return this.prisma.trabajador.count({
      where: { estado: 'activo' }
    });
  }

  async listarTrabajadoresActivos() {
    return this.prisma.trabajador.findMany({
      where: { estado: 'activo' },
      select: { nombre_completo: true },
      orderBy: { nombre_completo: 'asc' }
    });
  }

  async resumenPagos() {
    const pagos = await this.prisma.pagoTrabajador.findMany({
      select: { monto_total: true }
    });

    const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto_total), 0);
    const totalPagos = pagos.length;

    return { totalPagado, totalPagos };
  }

  async contarInsumosCriticos(): Promise<number> {
    const insumos = await this.prisma.catInsumos.findMany({
      include: {
        lotes: { select: { cant_actual: true } }
      }
    });

    return insumos.filter((insumo) => {
      const stockActual = insumo.lotes.reduce(
        (sum, lote) => sum + Number(lote.cant_actual), 0
      );
      return stockActual <= Number(insumo.stock_minimo);
    }).length;
  }

  async listarInsumosCriticos() {
    const insumos = await this.prisma.catInsumos.findMany({
      include: {
        lotes: { select: { cant_actual: true } }
      }
    });

    return insumos
      .filter((insumo) => {
        const stockActual = insumo.lotes.reduce(
          (sum, lote) => sum + Number(lote.cant_actual), 0
        );
        return stockActual <= Number(insumo.stock_minimo);
      })
      .map((insumo) => ({
        nombre: insumo.nombre_insumo,
        unidad: insumo.unidad_medida,
        stock_minimo: Number(insumo.stock_minimo),
        stock_actual: insumo.lotes.reduce(
          (sum, lote) => sum + Number(lote.cant_actual), 0
        )
      }));
  }
}