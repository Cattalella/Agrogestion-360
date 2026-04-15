import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async obtenerResumenFinanciero(fechaInicio: Date, fechaFin: Date) {
    const [ventas, pagos] = await Promise.all([
      this.prisma.venta.aggregate({
        where: {
          fecha_venta: { gte: fechaInicio, lte: fechaFin },
        },
        _sum: { precio_total: true },
        _count: { id_venta: true },
      }),
      this.prisma.pagoTrabajador.aggregate({
        where: {
          fecha_pago: { gte: fechaInicio, lte: fechaFin },
          estado_pago: { not: 'Anulado' },
        },
        _sum: { monto_total: true },
        _count: { id_pago: true },
      }),
    ]);

    const ingresos = Number(ventas._sum.precio_total || 0);
    const egresos = Number(pagos._sum.monto_total || 0);

    return {
      ingresos,
      egresos,
      balance: ingresos - egresos,
      detalle: {
        totalVentas: ventas._count.id_venta,
        totalPagosEfectuados: pagos._count.id_pago,
      },
    };
  }

  async obtenerInventarioCritico() {
    const insumos = await this.prisma.catInsumos.findMany({
      include: {
        lotes: {
          where: { cant_actual: { gt: 0 } },
        },
      },
    });

    const criticos = insumos.map(insumo => {
      const stock = insumo.lotes.reduce((acc, lote) => acc + Number(lote.cant_actual), 0);
      return {
        nombre: insumo.nombre_insumo,
        categoria: insumo.categoria,
        stock,
        minimo: Number(insumo.stock_minimo),
        unidad: insumo.unidad_medida,
      };
    }).filter(i => i.stock <= i.minimo);

    return criticos;
  }

  async obtenerActividadTrabajadores(fechaInicio: Date, fechaFin: Date) {
    const actividades = await this.prisma.trabajoRealizado.findMany({
      where: {
        fecha_inicio: { gte: fechaInicio },
        fecha_fin: { lte: fechaFin },
      },
      include: {
        Trabajador: {
          select: { nombre_completo: true }
        }
      },
      orderBy: { fecha_inicio: 'desc' }
    });

    return actividades;
  }

  async obtenerDashboard(fechaInicio: Date, fechaFin: Date) {
    const [financiero, criticos, personal] = await Promise.all([
      this.obtenerResumenFinanciero(fechaInicio, fechaFin),
      this.obtenerInventarioCritico(),
      this.prisma.trabajador.findMany({
        where: { estado: 'Activo' },
        take: 5
      })
    ]);

    return {
      ganancias: { tipo1: 'GANANCIA NETA', cantidad1: financiero.balance },
      inversion: { tipo1: 'INVERSIÓN TOTAL', cantidad1: financiero.egresos },
      gastosPorSector: [
        { name: 'PERSONAL', valor: financiero.egresos, color: '#8b5cf6', detalle: `Total: ${financiero.detalle.totalPagosEfectuados} pagos` },
        { name: 'VENTAS', valor: financiero.ingresos, color: '#10b981', detalle: `Total: ${financiero.detalle.totalVentas} ventas` }
      ],
      insumosCriticos: {
        dias: criticos.length,
        titulo: 'Insumos Críticos',
        lista: criticos.map(c => `${c.nombre}: ${c.stock}${c.unidad}`)
      },
      pagosTrabajadores: {
        titulo: 'Últimos Pagos',
        lista: [] // Podría agregarse detalle si se desea
      },
      trabajadoresActivos: {
        titulo: 'PERSONAL ACTIVO',
        lista: personal.map(t => t.nombre_completo)
      },
      filtrosDisponibles: ['ESTE MES', 'SEIS MESES', 'UN AÑO ATRÁS']
    };
  }
}
