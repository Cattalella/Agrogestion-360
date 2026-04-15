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

    // Calcular el stock total por cada insumo sumando sus lotes
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
    return this.prisma.solicitud.findMany({
      include: {
        insumo: true,
        solicitante: {
          select: { nombre_completo: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ============================================================
  // 📌 SOLICITUDES DE COMPRA (RF.7.1.1, RF.7.1.2)
  // ============================================================
  
  async crearSolicitud(idAdmin: number, datos: any) {
    // Buscamos o creamos el insumo en el catálogo primero si no existe
    let insumoId = datos.id_insumo;
    
    if (!insumoId) {
      const insumoExistente = await this.prisma.catInsumos.findFirst({
        where: { 
          nombre_insumo: { equals: datos.nombre_insumo, mode: 'insensitive' },
          unidad_medida: datos.unidad_medida
        }
      });

      if (insumoExistente) {
        insumoId = insumoExistente.id_insumo;
      } else {
        const nuevoInsumo = await this.prisma.catInsumos.create({
          data: {
            nombre_insumo: datos.nombre_insumo,
            unidad_medida: datos.unidad_medida,
            categoria: datos.categoria,
            especie_destino: datos.especie_destino || null,
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
        id_dueno: datos.id_dueno, // El dueño seleccionado o por defecto
        estado_sol: 'Pendiente',
        cantidad: new Decimal(datos.cantidad),
        fecha_compra: new Date(datos.fecha_compra_propuesta),
        motivo: datos.motivo,
        updatedAt: new Date(),
        proveedor: datos.proveedor || null
      }
    });
  }

  async procesarSolicitud(idDueno: number, idSolicitud: number, estado: 'Aprobada' | 'Rechazada', observaciones?: string) {
    return this.prisma.solicitud.update({
      where: { id_solicitud: idSolicitud, id_dueno: idDueno },
      data: {
        estado_sol: estado,
        fecha_aprobacion: new Date(),
        observaciones_aprob: observaciones,
        updatedAt: new Date()
      }
    });
  }

  async ejecutarCompra(idAdmin: number, idSolicitud: number, datosLote: any) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id_solicitud: idSolicitud, id_admin: idAdmin }
    });

    if (!solicitud || solicitud.estado_sol !== 'Aprobada') {
      throw new BadRequestException('Solo se pueden ejecutar compras aprobadas');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el lote en el inventario
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

      // 2. Marcar la solicitud como Ejecutada (podríamos usar un estado o campo extra)
      await tx.solicitud.update({
        where: { id_solicitud: idSolicitud },
        data: { estado_sol: 'Completada', updatedAt: new Date() }
      });

      return lote;
    });
  }

  // ============================================================
  // 📌 CONSUMO DE INSUMOS (RF.7.1.4)
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

      // Descontar de los lotes (PEPS - Primero en Entrar, Primero en Salir / Por vencimiento)
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

      // Registrar el consumo
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
