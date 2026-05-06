import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as moment from 'moment-timezone';

export enum FiltroFecha {
  ESTE_MES     = 'este_mes',
  MES_PASADO   = 'mes_pasado',
  SEIS_MESES   = 'seis_meses',
  UN_ANO_ATRAS = 'un_ano_atras',
  FECHA_ACTUAL = 'fecha_actual',
}

@Injectable()
export class AnaliticasService {
  constructor(private prisma: PrismaService) {}

  private async getGraficaGanancias(startDate: Date, endDate: Date) {
    const bimestres = [
      { name: 'Ene-Feb', n1: 'Ene', n2: 'Feb', meses: [0, 1] },
      { name: 'Mar-Abr', n1: 'Mar', n2: 'Abr', meses: [2, 3] },
      { name: 'May-Jun', n1: 'May', n2: 'Jun', meses: [4, 5] },
      { name: 'Jul-Ago', n1: 'Jul', n2: 'Ago', meses: [6, 7] },
      { name: 'Sep-Oct', n1: 'Sep', n2: 'Oct', meses: [8, 9] },
      { name: 'Nov-Dic', n1: 'Nov', n2: 'Dic', meses: [10, 11] },
    ];

    const ventas = await this.prisma.venta.findMany({
      where: {
        fecha_venta: { gte: startDate, lte: endDate },
      },
      select: {
        precio_total: true,
        fecha_venta: true,
      },
    });

    const resultados = bimestres.map(bimestre => ({
      name: bimestre.name,
      m1: 0,
      m2: 0,
      n1: bimestre.n1,
      n2: bimestre.n2,
    }));

    ventas.forEach(venta => {
      const fecha = new Date(venta.fecha_venta);
      const mes = fecha.getMonth();
      const valorEnMillones = Number(venta.precio_total) / 1000000;

      const bimestreIndex = bimestres.findIndex(b => b.meses.includes(mes));

      if (bimestreIndex !== -1) {
        if (mes === bimestres[bimestreIndex].meses[0]) {
          resultados[bimestreIndex].m1 += valorEnMillones;
        } else if (mes === bimestres[bimestreIndex].meses[1]) {
          resultados[bimestreIndex].m2 += valorEnMillones;
        }
      }
    });

    return resultados;
  }

  async getDashboard(filtro?: FiltroFecha, fechaInicio?: string, fechaFin?: string) {
    let startDate: Date;
    let endDate: Date;

    if (fechaInicio && fechaFin) {
      startDate = new Date(fechaInicio);
      endDate = new Date(fechaFin);
      console.log('📅 Rango personalizado:', { startDate, endDate });
    } else {
      const rango = this.getRango(filtro || FiltroFecha.ESTE_MES);
      startDate = rango.startDate;
      endDate = rango.endDate;
      console.log('📅 Período:', { filtro, startDate, endDate });
    }

    const graficaGanancias = await this.getGraficaGanancias(startDate, endDate);

    const ventasAgg = await this.prisma.venta.aggregate({
      _sum: { precio_total: true },
      where: { fecha_venta: { gte: startDate, lte: endDate } },
    });
    const totalVentas = Number(ventasAgg._sum.precio_total) ?? 0;

    // Suma valor_total (dinero), no cantidad
    const consumoInsumosAgg = await this.prisma.consumoInsumo.aggregate({
      _sum: { valor_total: true },
      where: { fecha_consumo: { gte: startDate, lte: endDate } },
    });
    const totalConsumoInsumos = Number(consumoInsumosAgg._sum.valor_total) ?? 0;

    // Suma precio_total (dinero), no cant_inicial
    const comprasInsumosAgg = await this.prisma.loteInv.aggregate({
      _sum: { precio_total: true },
      where: { fecha_compra: { gte: startDate, lte: endDate } },
    });
    const totalComprasInsumos = Number(comprasInsumosAgg._sum.precio_total) ?? 0;

    // Solo suma pagos aprobados por el boss (Pagado con firma)
    const pagosAgg = await this.prisma.pagoTrabajador.aggregate({
      _sum: { monto_total: true },
      where: {
        fecha_pago: { gte: startDate, lte: endDate },
        estado_pago: 'Pagado con firma',
      },
    });
    const totalPagosTrabajadores = Number(pagosAgg._sum.monto_total) ?? 0;

    const totalInversion = totalConsumoInsumos + totalComprasInsumos + totalPagosTrabajadores;

    const gastosPorSector = [
      {
        name: 'CONSUMO INSUMOS',
        valor: totalConsumoInsumos,
        color: '#f97316',
        detalle: `Consumo de insumos: ${this.formatearCOP(totalConsumoInsumos)}`
      },
      {
        name: 'COMPRAS INSUMOS',
        valor: totalComprasInsumos,
        color: '#8b5cf6',
        detalle: `Compras de insumos: ${this.formatearCOP(totalComprasInsumos)}`
      },
      {
        name: 'PAGOS TRABAJADORES',
        valor: totalPagosTrabajadores,
        color: '#ec489a',
        detalle: `Pagos a trabajadores: ${this.formatearCOP(totalPagosTrabajadores)}`
      }
    ].filter(s => s.valor > 0);

    const gastosParaMostrar = gastosPorSector.length > 0 ? gastosPorSector : [
      { name: 'Sin gastos', valor: 1, color: '#e5e7eb', detalle: 'No hay registros de gastos' }
    ];

    const solicitudesPendientes = await this.prisma.solicitud.count({
      where: {
        estado_sol: 'Pendiente',
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    // 🔧 AGREGADO: incluir lotes con fecha_venc para calcular alertas de vencimiento
    const insumos = await this.prisma.catInsumos.findMany({
      where: { lotes: { some: {} } },
      include: {
        lotes: {
          select: {
            cant_actual: true,
            fecha_venc: true,
            numero_lote: true,
          }
        }
      },
    });

    const hoy = new Date();

    // Insumos con stock bajo el mínimo (para el conteo original)
    const insumosCriticos = insumos.filter((insumo) => {
      const stockTotal = insumo.lotes.reduce((acc, l) => acc + Number(l.cant_actual), 0);
      return stockTotal < Number(insumo.stock_minimo);
    });

    // 🆕 Alertas de vencimiento próximo (30 días) — igual que useInventario del admin
    const alertasVencimiento: { nombre: string; mensaje: string; dias: number }[] = [];

    insumos.forEach((insumo) => {
      insumo.lotes.forEach((lote) => {
        if (lote.fecha_venc) {
          const fechaVence = new Date(lote.fecha_venc);
          const diasRestantes = Math.ceil(
            (fechaVence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diasRestantes <= 30 && diasRestantes >= 0) {
            alertasVencimiento.push({
              nombre: insumo.nombre_insumo,
              mensaje: `Lote ${lote.numero_lote || 'N/A'} vence en ${diasRestantes} días (${lote.fecha_venc.toISOString().split('T')[0]})`,
              dias: diasRestantes,
            });
          }
        }
      });
    });

    // Ordenar por días restantes (el más urgente primero)
    alertasVencimiento.sort((a, b) => a.dias - b.dias);

    // Días al vencimiento más próximo (0 si no hay alertas)
    const diasAlVencimientoProximo = alertasVencimiento.length > 0
      ? alertasVencimiento[0].dias
      : 0;

    const trabajadoresActivos = await this.prisma.trabajador.count({
      where: { estado: 'activo' },
    });

    const trabajadoresLista = await this.prisma.trabajador.findMany({
      where: { estado: 'activo' },
      select: {
        id_trabajador: true,
        nombre_completo: true,
      },
      orderBy: { nombre_completo: 'asc' },
    });

    const numPagosAprobados = await this.prisma.pagoTrabajador.count({
      where: {
        fecha_pago: { gte: startDate, lte: endDate },
        estado_pago: 'Pagado con firma',
        Trabajador: { estado: 'activo' },
      },
    });

    console.log('📊 Resultados:', {
      totalVentas,
      totalInversion,
      consumoInsumos: totalConsumoInsumos,
      comprasInsumos: totalComprasInsumos,
      pagosTrabajadores: totalPagosTrabajadores,
      trabajadoresActivos,
      numPagosAprobados,
      insumosCriticos: insumosCriticos.length,
      alertasVencimiento: alertasVencimiento.length,
    });

    return {
      ganancias: {
        total_ventas: totalVentas,
        total_inversion: totalInversion,
      },
      gastos_por_sector: gastosParaMostrar,
      supervision: {
        // Mantiene el conteo original
        insumos_criticos: insumosCriticos.length,
        // 🆕 Nuevos campos para el boss
        insumos_vencimiento: {
          dias_proximos: diasAlVencimientoProximo,
          lista: alertasVencimiento.map(a => `${a.nombre}: ${a.mensaje}`),
        },
        pagos_trabajadores: {
          total_pagado: totalPagosTrabajadores,
          num_pagos: numPagosAprobados,
        },
        trabajadores_activos: {
          total: trabajadoresActivos,
          lista: trabajadoresLista,
        },
      },
      grafica_ganancias: graficaGanancias,
      solicitudes_pendientes: solicitudesPendientes,
    };
  }

  private formatearCOP(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  }

  private getRango(filtro: FiltroFecha) {
    const colombia = moment.tz('America/Bogota');
    const hoy = colombia.clone();
    let startDate: moment.Moment;
    let endDate: moment.Moment;

    switch (filtro) {
      case FiltroFecha.ESTE_MES:
        startDate = hoy.clone().startOf('month').startOf('day');
        endDate = hoy.clone().endOf('day');
        break;
      case FiltroFecha.MES_PASADO:
        startDate = hoy.clone().subtract(1, 'month').startOf('month').startOf('day');
        endDate = hoy.clone().subtract(1, 'month').endOf('month').endOf('day');
        break;
      case FiltroFecha.SEIS_MESES:
        startDate = hoy.clone().subtract(6, 'months').startOf('day');
        endDate = hoy.clone().endOf('day');
        break;
      case FiltroFecha.UN_ANO_ATRAS:
        startDate = hoy.clone().subtract(1, 'year').startOf('day');
        endDate = hoy.clone().endOf('day');
        break;
      default:
        startDate = hoy.clone().startOf('month').startOf('day');
        endDate = hoy.clone().endOf('day');
    }

    const startDateUTC = startDate.clone().utc();
    const endDateUTC = endDate.clone().utc();

    console.log('📅 Rango calculado:', {
      filtro,
      startDateColombia: startDate.format('YYYY-MM-DD HH:mm:ss'),
      endDateColombia: endDate.format('YYYY-MM-DD HH:mm:ss'),
      startDateUTC: startDateUTC.format(),
      endDateUTC: endDateUTC.format(),
    });

    return {
      startDate: startDateUTC.toDate(),
      endDate: endDateUTC.toDate(),
    };
  }
}