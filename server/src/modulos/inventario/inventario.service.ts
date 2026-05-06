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
          bajoStock: stock <= 20,
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
          select: { 
            nombre_completo: true,
            foto_perfil: true
          }
        },
        aprobador: {
          select: { nombre_completo: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const comprasReales = await this.prisma.loteInv.findMany({
      where: { id_solicitud: { not: null } },
      select: { id_solicitud: true }
    });

    const idsSolicitudesEjecutadas = new Set(comprasReales.map(c => c.id_solicitud));

    return solicitudes.map(s => {
      let nombreProducto = '';
      let tipoProducto = '';
      
      if (s.insumo) {
        nombreProducto = s.insumo.nombre_insumo;
        tipoProducto = s.insumo.categoria === 'alimento' ? 'alimento' : 'insumo';
      } else {
        nombreProducto = 'Producto pendiente';
        tipoProducto = 'insumo';
      }

      return {
        id_solicitud: s.id_solicitud,
        id: s.id_solicitud,
        tipo: tipoProducto,
        fecha_compra: s.fecha_compra ? new Date(s.fecha_compra).toISOString().split('T')[0] : null,
        cantidad: s.cantidad,
        unidad_medida: s.insumo?.unidad_medida || 'kg',
        motivo: s.motivo,
        estado_sol: s.estado_sol,
        createdAt: s.createdAt,
        fecha_creacion: s.createdAt ? new Date(s.createdAt).toISOString() : null,
        usuario: s.solicitante?.nombre_completo || 'Admin',
        fotoUsuario: s.solicitante?.foto_perfil || null,
        tipo_insumo: s.insumo?.categoria !== 'alimento' ? nombreProducto : null,
        tipo_alimento: s.insumo?.categoria === 'alimento' ? nombreProducto : null,
        categoria_insumo: s.insumo?.categoria !== 'alimento' ? s.insumo?.categoria : null,
        fechaVencimiento: null,
        especie_destino: s.insumo?.especie_destino,
        proveedor: s.proveedor || 'No especificado',
        categoria_alimento: s.insumo?.categoria === 'alimento' ? s.insumo?.categoria : null,
        cantidad_num: Number(s.cantidad),
        ejecutada: idsSolicitudesEjecutadas.has(s.id_solicitud),
        precio_total: s.precio_total ? Number(s.precio_total) : 0
      };
    });
  }

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
        proveedor: datos.proveedor || null,
        precio_total: datos.precio_total ? new Decimal(datos.precio_total) : null,
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

    const compraExistente = await this.prisma.loteInv.findFirst({
      where: { id_solicitud: id_solicitud }
    });

    if (compraExistente) {
      throw new BadRequestException('Esta compra ya fue registrada. No se puede duplicar.');
    }

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

    // ✅ CREAR LOTE CON PRECIO_TOTAL
    const lote = await this.prisma.loteInv.create({
      data: {
        id_insumo: id_insumo,
        id_solicitud: id_solicitud,
        numero_lote: numero_lote,
        cant_inicial: new Decimal(cantidad_real),
        cant_actual: new Decimal(cantidad_real),
        precio_total: new Decimal(precio_total || 0),
        fecha_compra: new Date(fecha_compra_real),
        fecha_venc: fecha_vencimiento ? new Date(fecha_vencimiento) : null,
        proveedor: proveedor_real,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.prisma.solicitud.update({
      where: { id_solicitud },
      data: {
        fecha_compra: new Date(fecha_compra_real),
        proveedor: proveedor_real,
        precio_total: new Decimal(precio_total || 0),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Compra real registrada para solicitud ${id_solicitud}, lote: ${numero_lote}, total: ${precio_total}`);

    return {
      mensaje: 'Compra registrada exitosamente',
      lote,
      id_solicitud,
      precio_total,
    };
  }

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

    const compraExistente = await this.prisma.loteInv.findFirst({
      where: { id_solicitud: idSolicitud }
    });

    if (compraExistente) {
      throw new BadRequestException('Esta compra ya fue registrada. No se puede duplicar.');
    }

    return this.prisma.$transaction(async (tx) => {
      const lote = await tx.loteInv.create({
        data: {
          id_insumo: solicitud.id_insumo,
          id_solicitud: idSolicitud,
          cant_inicial: solicitud.cantidad,
          cant_actual: solicitud.cantidad,
          precio_total: new Decimal(0),
          fecha_venc: datosLote.fecha_vencimiento ? new Date(datosLote.fecha_vencimiento) : null,
          numero_lote: datosLote.numero_lote,
          proveedor: solicitud.proveedor,
          updatedAt: new Date()
        }
      });

      await tx.solicitud.update({
        where: { id_solicitud: idSolicitud },
        data: { estado_sol: 'Aprobada', updatedAt: new Date() }
      });

      return lote;
    });
  }

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

    console.log(`🗑️ Eliminando solicitud ${id} por motivo: ${motivoEliminacion}`);

    return this.prisma.solicitud.delete({
      where: { id_solicitud: id }
    });
  }

  async registrarConsumo(datos: any) {
    if (!datos.id_insumo) {
      throw new BadRequestException('El id_insumo es obligatorio');
    }
    if (!datos.id_responsable) {
      throw new BadRequestException('El id_responsable es obligatorio');
    }
    if (!datos.cantidad || datos.cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }
    if (!datos.actividad) {
      throw new BadRequestException('La actividad es obligatoria');
    }

    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id_trabajador: datos.id_responsable }
    });

    if (!trabajador) {
      throw new BadRequestException('Trabajador no encontrado');
    }

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

    const precioUnitario = datos.precio_unitario || 0;
    const valorTotalGastado = cantidadAConsumir * precioUnitario;

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

      const consumo = await tx.consumoInsumo.create({
        data: {
          id_insumo: insumo.id_insumo,
          id_trabajador: datos.id_responsable,
          actividad: datos.actividad,
          cantidad: new Decimal(cantidadAConsumir),
          valor_total: new Decimal(valorTotalGastado),
          precio_unitario: new Decimal(precioUnitario),
          observaciones: datos.observaciones || '',
          fecha_consumo: new Date(datos.fecha_consumo || new Date())
        }
      });

      return {
        mensaje: 'Consumo registrado exitosamente',
        consumo
      };
    });
  }

  async obtenerConsumos() {
    const consumos = await this.prisma.consumoInsumo.findMany({
      include: {
        CatInsumos: true,
        Trabajador: true
      },
      orderBy: { fecha_consumo: 'desc' }
    });

    return consumos.map(c => ({
      id: c.id_consumo,
      actividad: c.actividad,
      fecha_consumo: c.fecha_consumo,
      id_insumo: c.id_insumo,
      nombreInsumo: c.CatInsumos?.nombre_insumo,
      cantidad: c.cantidad,
      valor_total: c.valor_total ? Number(c.valor_total) : 0,
      precio_unitario: c.precio_unitario ? Number(c.precio_unitario) : 0,
      unidadMedida: c.CatInsumos?.unidad_medida,
      responsable: c.Trabajador?.nombre_completo,
      observaciones: c.observaciones
    }));
  }

  async obtenerInsumosCriticos() {
    const insumos = await this.prisma.catInsumos.findMany({
      include: {
        lotes: {
          where: { cant_actual: { gt: 0 } }
        }
      }
    });

    return insumos
      .map(insumo => {
        const stock = insumo.lotes.reduce((acc, lote) => acc + Number(lote.cant_actual), 0);
        return {
          id: insumo.id_insumo,
          nombre: insumo.nombre_insumo,
          stock_actual: stock,
          stock_minimo: insumo.stock_minimo,
          unidad: insumo.unidad_medida,
          critico: stock <= 20
        };
      })
      .filter(i => i.critico);
  }

  async actualizarConsumo(id: number, datos: any) {
    return this.prisma.consumoInsumo.update({
      where: { id_consumo: id },
      data: {
        actividad: datos.actividad,
        cantidad: datos.cantidad ? new Decimal(datos.cantidad) : undefined,
        valor_total: datos.valor_total ? new Decimal(datos.valor_total) : undefined,
        observaciones: datos.observaciones,
        fecha_consumo: datos.fecha_consumo ? new Date(datos.fecha_consumo) : undefined
      }
    });
  }

  async eliminarConsumo(id: number) {
    return this.prisma.consumoInsumo.delete({
      where: { id_consumo: id }
    });
  }
}