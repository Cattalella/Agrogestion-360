import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class InventarioService {
  constructor(
    private prisma: PrismaService,
    private auditoria: AuditoriaService
  ) {}

  // ============================================================
  // 📌 GESTIÓN DE CATÁLOGO DE INSUMOS
  // ============================================================
  
  async obtenerInventarioActual() {
    const insumos = await this.prisma.catInsumos.findMany({
      include: {
        lotes: {
          where: { cant_actual: { gt: 0 } },
          orderBy: { fecha_venc: 'asc' }
        }
      }
    });

    return insumos.map(insumo => {
      const stock = insumo.lotes.reduce((acc, lote) => acc + Number(lote.cant_actual), 0);
      return {
        ...insumo,
        stockTotal: stock,
        alertas: {
          bajoStock: stock <= Number(insumo.stock_minimo),
          vencimientoProximo: insumo.lotes.some(lote => {
            if (!lote.fecha_venc) return false;
            const diasParaVencer = Math.ceil((new Date(lote.fecha_venc).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return diasParaVencer <= 30 && diasParaVencer >= 0;
          })
        }
      };
    });
  }

  async obtenerSolicitudes() {
    const solicitudes = await this.prisma.solicitud.findMany({
      include: {
        insumo: true,
        solicitante: {
          select: { nombre_completo: true }
        },
        aprobador: {
          select: { nombre_completo: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return solicitudes.map(s => ({
      id_solicitud: s.id_solicitud,
      tipo: s.insumo?.categoria === 'alimento' ? 'alimento' : 'insumo',
      fecha_compra: s.fecha_compra,
      cantidad: s.cantidad,
      unidad_medida: s.insumo?.unidad_medida || 'kg',
      motivo: s.motivo,
      estado_sol: s.estado_sol,
      createdAt: s.createdAt,
      usuario: s.solicitante?.nombre_completo,
      tipoInsumo: s.insumo?.categoria !== 'alimento' ? s.insumo?.nombre_insumo : null,
      categoriaInsumo: s.insumo?.categoria !== 'alimento' ? s.insumo?.categoria : null,
      fechaVencimiento: null,
      tipoAlimento: s.insumo?.categoria === 'alimento' ? s.insumo?.nombre_insumo : null,
      especieDestino: s.insumo?.especie_destino,
      proveedor: s.proveedor,
      categoriaAlimento: s.insumo?.categoria === 'alimento' ? s.insumo?.categoria : null
    }));
  }

  // ============================================================
  // 📌 SOLICITUDES DE COMPRA
  // ============================================================
  
  async crearSolicitud(idAdmin: number, datos: any) {
    let idDueno = datos.id_dueno;
    if (!idDueno) {
      const dueno = await this.prisma.persona.findFirst({
        where: { rol: { nombre_rol: 'Dueño' } }
      });
      idDueno = dueno?.id_persona || 1;
    }

    const nombreInsumo = datos.nombre_insumo || datos.tipoInsumo || datos.tipoAlimento;
    if (!nombreInsumo) {
      throw new BadRequestException('El nombre del insumo/alimento es obligatorio');
    }

    const categoria = datos.categoria || (datos.tipo === 'alimento' ? 'alimento' : 'insumo');
    const unidadMedida = datos.unidad_medida || 'kg';

    let insumoId = datos.id_insumo;
    if (!insumoId) {
      const insumoExistente = await this.prisma.catInsumos.findFirst({
        where: { 
          nombre_insumo: { equals: nombreInsumo, mode: 'insensitive' },
          unidad_medida: unidadMedida
        }
      });

      if (insumoExistente) {
        insumoId = insumoExistente.id_insumo;
      } else {
        const nuevoInsumo = await this.prisma.catInsumos.create({
          data: {
            nombre_insumo: nombreInsumo,
            unidad_medida: unidadMedida,
            categoria: categoria,
            especie_destino: datos.especieDestino || datos.especie_destino || null,
            stock_minimo: datos.stock_minimo || 0,
            updatedAt: new Date()
          }
        });
        insumoId = nuevoInsumo.id_insumo;
      }
    }

    return this.prisma.solicitud.create({
      data: {
        id_insumo: insumoId,
        id_admin: idAdmin,
        id_dueno: idDueno,
        estado_sol: 'Pendiente',
        cantidad: new Decimal(datos.cantidad),
        fecha_compra: new Date(datos.fecha_compra_propuesta),
        motivo: datos.motivo,
        updatedAt: new Date(),
        proveedor: datos.proveedor || null
      }
    });
  }

  async actualizarSolicitud(id: number, idAdmin: number, datos: any) {
    const solicitud = await this.prisma.solicitud.findFirst({
      where: { id_solicitud: id, id_admin: idAdmin }
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estado_sol !== 'Pendiente') {
      throw new BadRequestException('Solo se pueden editar solicitudes pendientes');
    }

    const dataToUpdate: any = {
      updatedAt: new Date()
    };

    if (datos.cantidad !== undefined) dataToUpdate.cantidad = new Decimal(datos.cantidad);
    if (datos.motivo !== undefined) dataToUpdate.motivo = datos.motivo;
    if (datos.fecha_compra !== undefined) dataToUpdate.fecha_compra = new Date(datos.fecha_compra);
    if (datos.proveedor !== undefined) dataToUpdate.proveedor = datos.proveedor;

    // Actualizar insumo si cambia
    if (datos.nombre_insumo) {
      let insumoId = solicitud.id_insumo;
      const insumoExistente = await this.prisma.catInsumos.findFirst({
        where: { 
          nombre_insumo: { equals: datos.nombre_insumo, mode: 'insensitive' },
          unidad_medida: datos.unidad_medida || 'kg'
        }
      });

      if (insumoExistente) {
        insumoId = insumoExistente.id_insumo;
      } else {
        const nuevoInsumo = await this.prisma.catInsumos.create({
          data: {
            nombre_insumo: datos.nombre_insumo,
            unidad_medida: datos.unidad_medida || 'kg',
            categoria: datos.categoria || 'insumo',
            updatedAt: new Date()
          }
        });
        insumoId = nuevoInsumo.id_insumo;
      }
      dataToUpdate.id_insumo = insumoId;
    }

    return this.prisma.solicitud.update({
      where: { id_solicitud: id },
      data: dataToUpdate
    });
  }

  async procesarSolicitud(idDueno: number, idSolicitud: number, estado: 'Aprobada' | 'Rechazada', observaciones?: string) {
    const solicitud = await this.prisma.solicitud.findFirst({
      where: { id_solicitud: idSolicitud, id_dueno: idDueno }
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada o no tienes permisos');
    }

    return this.prisma.solicitud.update({
      where: { id_solicitud: idSolicitud },
      data: {
        estado_sol: estado,
        fecha_aprobacion: new Date(),
        observaciones_aprob: observaciones,
        updatedAt: new Date()
      }
    });
  }

  // ============================================================
  // 🆕 EJECUTAR COMPRA REAL (con todos los datos del formulario)
  // ============================================================
  async ejecutarCompraReal(datosCompra: any) {
    const {
      id_solicitud,
      fecha_compra_real,
      numero_lote,
      cantidad_real,
      precio_unitario,
      precio_total,
      factura,
      fecha_vencimiento,
      proveedor_real,
      observaciones,
      tipo,
      nombre_producto,
      unidad_medida,
    } = datosCompra;

    // 1. Verificar que la solicitud existe y está aprobada
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id_solicitud },
      include: { insumo: true },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estado_sol !== 'Aprobada') {
      throw new BadRequestException('La solicitud debe estar aprobada para ejecutar la compra');
    }

    // 2. Buscar o crear el insumo en CatInsumos
    let id_insumo = solicitud.id_insumo;

    if (!id_insumo) {
      const nuevoInsumo = await this.prisma.catInsumos.create({
        data: {
          nombre_insumo: nombre_producto,
          unidad_medida: unidad_medida,
          categoria: tipo === 'insumo' ? 'insumo' : 'alimento',
          stock_minimo: 0,
          updatedAt: new Date(),
        },
      });
      id_insumo = nuevoInsumo.id_insumo;
    }

    // 3. Crear el lote en LoteInv
    const lote = await this.prisma.loteInv.create({
      data: {
        id_insumo: id_insumo,
        numero_lote: numero_lote,
        cant_inicial: new Decimal(cantidad_real),
        cant_actual: new Decimal(cantidad_real),
        fecha_compra: new Date(fecha_compra_real),
        fecha_venc: fecha_vencimiento ? new Date(fecha_vencimiento) : null,
        proveedor: proveedor_real,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 4. Actualizar la solicitud con los datos de la compra real
    await this.prisma.solicitud.update({
      where: { id_solicitud },
      data: {
        fecha_compra: new Date(fecha_compra_real),
        proveedor: proveedor_real,
        updatedAt: new Date(),
      },
    });

    // 5. Registrar auditoría (opcional)
    console.log(`✅ Compra real registrada para solicitud ${id_solicitud}, lote: ${numero_lote}`);

    return {
      mensaje: 'Compra registrada exitosamente',
      lote,
      id_solicitud,
    };
  }

  // ============================================================
  // EJECUTAR COMPRA (versión simple - solo marca como ejecutada)
  // ============================================================
  async ejecutarCompra(idAdmin: number, idSolicitud: number, datosLote: any) {
    const solicitud = await this.prisma.solicitud.findFirst({
      where: { id_solicitud: idSolicitud, id_admin: idAdmin }
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estado_sol !== 'Aprobada') {
      throw new BadRequestException('Solo se pueden ejecutar compras aprobadas');
    }

    return this.prisma.$transaction(async (tx) => {
      const lote = await tx.loteInv.create({
        data: {
          id_insumo: solicitud.id_insumo,
          cant_inicial: solicitud.cantidad,
          cant_actual: solicitud.cantidad,
          fecha_venc: datosLote.fecha_vencimiento ? new Date(datosLote.fecha_vencimiento) : null,
          numero_lote: datosLote.numero_lote,
          proveedor: solicitud.proveedor,
          updatedAt: new Date()
        }
      });

      await tx.solicitud.update({
        where: { id_solicitud: idSolicitud },
        data: { estado_sol: 'Completada', updatedAt: new Date() }
      });

      return lote;
    });
  }

  // ============================================================
  // 📌 ELIMINAR SOLICITUD (DELETE REAL)
  // ============================================================
  async eliminarSolicitud(id: number, motivoEliminacion: string) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id_solicitud: id }
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estado_sol !== 'Pendiente') {
      throw new BadRequestException('Solo se pueden eliminar solicitudes pendientes');
    }

    // Registrar auditoría (opcional)
    console.log(`🗑️ Eliminando solicitud ${id} por motivo: ${motivoEliminacion}`);

    // DELETE real
    return this.prisma.solicitud.delete({
      where: { id_solicitud: id }
    });
  }

  // ============================================================
  // 📌 CONSUMO DE INSUMOS
  // ============================================================

  async registrarConsumo(idResponsable: number, datos: any) {
    const insumo = await this.prisma.catInsumos.findUnique({
      where: { id_insumo: datos.id_insumo },
      include: { lotes: { where: { cant_actual: { gt: 0 } }, orderBy: { fecha_venc: 'asc' } } }
    });

    if (!insumo) throw new NotFoundException('Insumo no encontrado');

    const stockActual = insumo.lotes.reduce((acc, lote) => acc + Number(lote.cant_actual), 0);
    const cantidadAConsumir = Number(datos.cantidad);

    if (stockActual < cantidadAConsumir) {
      throw new BadRequestException(`Stock insuficiente. Disponible: ${stockActual} ${insumo.unidad_medida}`);
    }

    return this.prisma.$transaction(async (tx) => {
      let restante = cantidadAConsumir;

      for (const lote of insumo.lotes) {
        if (restante <= 0) break;
        
        const cantLote = Number(lote.cant_actual);
        const aDescontar = Math.min(cantLote, restante);
        
        await tx.loteInv.update({
          where: { id_lote: lote.id_lote },
          data: { 
            cant_actual: new Decimal(cantLote - aDescontar),
            updatedAt: new Date()
          }
        });

        restante -= aDescontar;
      }

      return tx.consumoInsumo.create({
        data: {
          id_insumo: insumo.id_insumo,
          id_responsable: idResponsable,
          actividad: datos.actividad,
          cantidad: new Decimal(cantidadAConsumir),
          observaciones: datos.observaciones,
          fecha_consumo: new Date()
        }
      });
    });
  }
}