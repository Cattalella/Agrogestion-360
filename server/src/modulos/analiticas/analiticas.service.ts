import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export enum FiltroFecha {
  ESTE_MES     = 'este_mes',
  SEIS_MESES   = 'seis_meses',
  UN_ANO_ATRAS = 'un_ano_atras',
  FECHA_ACTUAL = 'fecha_actual',
}

@Injectable()
export class AnaliticasService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(filtro: FiltroFecha) {
    const { startDate, endDate } = this.getRango(filtro);

    const [ventas, lotes, consumos, solicitudes, pagos, trabajadores, insumos] =
      await Promise.all([
        // Ganancias: ventas en el rango
        this.prisma.venta.aggregate({
          _sum: { precio_total: true },
          where: { fecha_venta: { gte: startDate, lte: endDate } },
        }),

        // Inversión: lotes comprados en el rango
        this.prisma.loteInv.aggregate({
          _sum: { cant_inicial: true },
          where: { fecha_compra: { gte: startDate, lte: endDate } },
        }),

        // Gastos por sector (actividad)
        this.prisma.consumoInsumo.groupBy({
          by: ['actividad'],
          _sum: { cantidad: true },
          where: { fecha_consumo: { gte: startDate, lte: endDate } },
        }),

        // Solicitudes pendientes
        this.prisma.solicitud.count({
          where: {
            estado_sol: 'pendiente',
            createdAt: { gte: startDate, lte: endDate },
          },
        }),

        // Pagos a trabajadores
        this.prisma.pagoTrabajador.aggregate({
          _sum: { monto_total: true },
          _count: true,
          where: { fecha_pago: { gte: startDate, lte: endDate } },
        }),

        // Trabajadores activos
        this.prisma.trabajador.count({
          where: { estado: 'Activo' },
        }),

        // Insumos críticos (stock actual < stock mínimo)
        this.prisma.catInsumos.findMany({
          where: {
            lotes: {
              some: {},
            },
          },
          include: {
            lotes: {
              select: { cant_actual: true },
            },
          },
        }),
      ]);

    // Calcular insumos críticos
    const insumosCriticos = insumos.filter((insumo) => {
      const stockTotal = insumo.lotes.reduce(
        (acc, l) => acc + Number(l.cant_actual),
        0,
      );
      return stockTotal < Number(insumo.stock_minimo);
    });

    return {
      ganancias: {
        total_ventas:    Number(ventas._sum.precio_total)  ?? 0,
        total_inversion: Number(lotes._sum.cant_inicial)   ?? 0,
      },
      gastos_por_sector: consumos.map((c) => ({
        sector: c.actividad,
        total:  Number(c._sum.cantidad),
      })),
      solicitudes: {
        pendientes: solicitudes,
      },
      supervision: {
        insumos_criticos:    insumosCriticos.length,
        pagos_trabajadores: {
          total_pagado: Number(pagos._sum.monto_total) ?? 0,
          num_pagos:    pagos._count,
        },
        trabajadores_activos: trabajadores,
      },
    };
  }

  private getRango(filtro: FiltroFecha) {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (filtro) {
      case FiltroFecha.ESTE_MES:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case FiltroFecha.SEIS_MESES:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case FiltroFecha.UN_ANO_ATRAS:
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case FiltroFecha.FECHA_ACTUAL:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate   = new Date(now.setHours(23, 59, 59, 999));
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  }
}