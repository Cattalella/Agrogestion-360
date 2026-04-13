// src/utils/formatearUnidades.ts

/**
 * Formatea números para mostrar en unidades legibles (B, M, K)
 * @example
 * formatearUnidades(2500)  // "2.5B"
 * formatearUnidades(1500)  // "1.5B"  
 * formatearUnidades(500)   // "500M"
 * formatearUnidades(0.5)   // "500K"
 */
export const formatearUnidades = (val: number): string => {
    if (val >= 1000) return `${(val / 1000).toFixed(1).replace(/\.0$/, "")}B`;
    if (val >= 1) return `${val.toFixed(1).replace(/\.0$/, "")}M`;
    return `${(val * 1000).toFixed(0)}K`;
};