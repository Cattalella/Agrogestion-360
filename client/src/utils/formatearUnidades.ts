// src/utils/formatearUnidades.ts

/**
 * Formatea números para mostrar en moneda colombiana (COP)
 * @example
 * formatearUnidades(50000)    // "$50.000"
 * formatearUnidades(1500000)  // "$1.500.000"
 * formatearUnidades(0)        // "$0"
 * formatearUnidades(5000000)  // "$5.000.000"
 */
export const formatearUnidades = (val: number): string => {
    if (val === 0) return '$0';
    
    // Formato moneda colombiana
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(val);
};

// Mantener la función original para compatibilidad si se usa en otros lugares
export const formatearUnidadesSimple = (val: number): string => {
    if (val >= 1000) return `${(val / 1000).toFixed(1).replace(/\.0$/, "")}B`;
    if (val >= 1) return `${val.toFixed(1).replace(/\.0$/, "")}M`;
    return `${(val * 1000).toFixed(0)}K`;
};