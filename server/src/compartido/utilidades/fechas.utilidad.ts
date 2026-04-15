// src/compartido/utilidades/fechas.utilidad.ts

export const formatearFecha = (fecha: Date): string => {
  return fecha.toISOString().split('T')[0];
};

export const obtenerFechaHoy = (): string => {
  return formatearFecha(new Date());
};

export const sumarDias = (fecha: Date, dias: number): Date => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);
  return nuevaFecha;
};

export const esFechaVencida = (fecha: Date): boolean => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaComparar = new Date(fecha);
  fechaComparar.setHours(0, 0, 0, 0);
  return fechaComparar < hoy;
};

export const esFechaFutura = (fecha: Date): boolean => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaComparar = new Date(fecha);
  fechaComparar.setHours(0, 0, 0, 0);
  return fechaComparar > hoy;
};