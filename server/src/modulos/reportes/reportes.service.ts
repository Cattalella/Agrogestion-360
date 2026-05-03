import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// ✅ Una sola interfaz, bien exportada
export interface GastoPorSector {
  sector: string;
  total: number;
}

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  // ============================================================
  // RESUMEN FINANCIERO
  // ============================================================
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

  // ============================================================
  // INVENTARIO CRÍTICO
  // ============================================================
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

  // ============================================================
  // ACTIVIDAD TRABAJADORES
  // ============================================================
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

  // ============================================================
  // OBTENER VENTAS AGRUPADAS POR BIMESTRE
  // ============================================================
  async obtenerVentasPorBimestre(fechaInicio: Date, fechaFin: Date) {
    const bimestres = [
      { nombre: 'Ene-Feb', meses: [0, 1], nombres: ['Ene', 'Feb'] },
      { nombre: 'Mar-Abr', meses: [2, 3], nombres: ['Mar', 'Abr'] },
      { nombre: 'May-Jun', meses: [4, 5], nombres: ['May', 'Jun'] },
      { nombre: 'Jul-Ago', meses: [6, 7], nombres: ['Jul', 'Ago'] },
      { nombre: 'Sep-Oct', meses: [8, 9], nombres: ['Sep', 'Oct'] },
      { nombre: 'Nov-Dic', meses: [10, 11], nombres: ['Nov', 'Dic'] },
    ];

    const ventas = await this.prisma.venta.findMany({
      where: {
        fecha_venta: { gte: fechaInicio, lte: fechaFin },
      },
      select: {
        precio_total: true,
        fecha_venta: true,
      },
    });

    const resultados = bimestres.map(bimestre => {
      let m1 = 0;
      let m2 = 0;

      ventas.forEach(venta => {
        const mesVenta = new Date(venta.fecha_venta).getMonth();
        const valor = Number(venta.precio_total);

        if (mesVenta === bimestre.meses[0]) {
          m1 += valor;
        } else if (mesVenta === bimestre.meses[1]) {
          m2 += valor;
        }
      });

      return {
        name: bimestre.nombre,
        m1: Math.round(m1 / 1000000),
        m2: Math.round(m2 / 1000000),
        n1: bimestre.nombres[0],
        n2: bimestre.nombres[1],
      };
    });

    return resultados;
  }

  // ============================================================
  // OBTENER GASTOS POR SECTOR
  // ============================================================
  async obtenerGastosPorSector(fechaInicio: Date, fechaFin: Date): Promise<GastoPorSector[]> {
    const pagosPersonal = await this.prisma.pagoTrabajador.aggregate({
      where: {
        fecha_pago: { gte: fechaInicio, lte: fechaFin },
        estado_pago: { not: 'Anulado' },
      },
      _sum: { monto_total: true },
    });

    const compras = await this.prisma.solicitud.findMany({
      where: {
        fecha_compra: { gte: fechaInicio, lte: fechaFin },
        estado_sol: 'Aprobada',
      },
      include: { insumo: true },
    });

    let alimentacion = 0;
    let mantenimiento = 0;
    let inventario = 0;

    compras.forEach(compra => {
      const monto = Number(compra.cantidad);
      const categoria = compra.insumo?.categoria?.toUpperCase() || '';

      if (categoria.includes('ALIMENTO') || categoria.includes('COMIDA')) {
        alimentacion += monto;
      } else if (categoria.includes('MANTENIMIENTO') || categoria.includes('EQUIPO')) {
        mantenimiento += monto;
      } else {
        inventario += monto;
      }
    });

    const personal = Number(pagosPersonal._sum.monto_total || 0);
    const sectores: GastoPorSector[] = [];

    if (personal > 0) {
      sectores.push({ sector: 'PERSONAL', total: personal });
    }
    if (alimentacion > 0) {
      sectores.push({ sector: 'ALIMENTACIÓN', total: alimentacion });
    }
    if (mantenimiento > 0) {
      sectores.push({ sector: 'MANTENIMIENTO', total: mantenimiento });
    }
    if (inventario > 0) {
      sectores.push({ sector: 'INVENTARIO', total: inventario });
    }

    return sectores;
  }

  // ============================================================
  // DASHBOARD
  // ============================================================
  async obtenerDashboard(fechaInicio: Date, fechaFin: Date): Promise<any> {
    const [financiero, criticos, personal, ventasPorBimestre, gastosPorSector] = await Promise.all([
      this.obtenerResumenFinanciero(fechaInicio, fechaFin),
      this.obtenerInventarioCritico(),
      this.prisma.trabajador.findMany({
        where: { estado: 'Activo' },
        take: 5
      }),
      this.obtenerVentasPorBimestre(fechaInicio, fechaFin),
      this.obtenerGastosPorSector(fechaInicio, fechaFin),
    ]);

    return {
      ganancias: { tipo1: 'TOTAL VENTAS', cantidad1: financiero.ingresos },
      inversion: { tipo1: 'TOTAL INVERSIÓN', cantidad1: financiero.egresos },
      gastos_por_sector: gastosPorSector,
      grafica_ganancias: ventasPorBimestre,
      supervision: {
        insumos_criticos: criticos.length,
        pagos_trabajadores: {
          total_pagado: financiero.egresos,
          num_pagos: financiero.detalle.totalPagosEfectuados
        },
        trabajadores_activos: personal.length
      },
      filtrosDisponibles: ['ESTE MES', 'SEIS MESES', 'UN AÑO ATRÁS']
    };
  }
}