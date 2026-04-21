import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ============================================================
// 📌 TIPOS
// ============================================================
export type EstadoInventario = 'Disponible' | 'Bajo Stock' | 'Agotado' | 'Vencido';

export interface ItemInventario {
    id: number;
    nombre: string;
    categoria: string;
    stockActual: number;
    stockMinimo: number;
    unidad: string;
    fechaVencimiento?: string;
    lote?: string;
    proveedor?: string;
}

export interface AlertaInventario {
    id: number;
    tipo: 'VENCIMIENTO' | 'BAJO_STOCK';
    nombre: string;
    mensaje: string;
}

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useInventario = () => {
    const [inventario, setInventario] = useState<(ItemInventario & { estado: EstadoInventario })[]>([]);
    const [alertas, setAlertas] = useState<AlertaInventario[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ============================================================
    // CALCULAR ESTADO DEL ITEM
    // ============================================================
    const calcularEstado = (stockActual: number, stockMinimo: number, fechaVencimiento?: string): EstadoInventario => {
        // Verificar vencimiento
        if (fechaVencimiento) {
            const hoy = new Date();
            const vence = new Date(fechaVencimiento);
            if (vence < hoy) return 'Vencido';
        }
        
        // Verificar stock
        if (stockActual <= 0) return 'Agotado';
        if (stockActual <= stockMinimo) return 'Bajo Stock';
        return 'Disponible';
    };

    // ============================================================
    // GENERAR ALERTAS
    // ============================================================
    const generarAlertas = (items: any[]): AlertaInventario[] => {
        const nuevasAlertas: AlertaInventario[] = [];
        const hoy = new Date();
        
        items.forEach((item: any) => {
            const stockActual = item.stockTotal || 0;
            const stockMinimo = item.stock_minimo || 0;
            
            // Alerta de bajo stock
            if (stockActual <= stockMinimo && stockActual > 0) {
                nuevasAlertas.push({
                    id: item.id_insumo,
                    tipo: 'BAJO_STOCK',
                    nombre: item.nombre_insumo,
                    mensaje: `Stock bajo: ${stockActual} ${item.unidad_medida} disponible (mínimo: ${stockMinimo})`,
                });
            }
            
            // Alerta de vencimiento próximo (30 días)
            if (item.lotes && item.lotes.length > 0) {
                item.lotes.forEach((lote: any) => {
                    if (lote.fecha_venc) {
                        const fechaVence = new Date(lote.fecha_venc);
                        const diasRestantes = Math.ceil((fechaVence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                        
                        if (diasRestantes <= 30 && diasRestantes >= 0) {
                            nuevasAlertas.push({
                                id: lote.id_lote,
                                tipo: 'VENCIMIENTO',
                                nombre: item.nombre_insumo,
                                mensaje: `Lote ${lote.numero_lote || 'N/A'} vence en ${diasRestantes} días (${lote.fecha_venc.split('T')[0]})`,
                            });
                        }
                    }
                });
            }
        });
        
        return nuevasAlertas;
    };

    // ============================================================
    // TRANSFORMAR DATOS DEL BACKEND
    // ============================================================
    const transformarDatos = (data: any[]): (ItemInventario & { estado: EstadoInventario })[] => {
        return data.map((item: any) => {
            const stockActual = item.stockTotal || 0;
            const stockMinimo = item.stock_minimo || 0;
            const fechaVencimiento = item.lotes?.find((l: any) => l.fecha_venc)?.fecha_venc;
            
            // Obtener el lote más próximo a vencer
            const loteProximo = item.lotes?.filter((l: any) => l.fecha_venc)
                .sort((a: any, b: any) => new Date(a.fecha_venc).getTime() - new Date(b.fecha_venc).getTime())[0];
            
            return {
                id: item.id_insumo,
                nombre: item.nombre_insumo,
                categoria: item.categoria || 'General',
                stockActual: stockActual,
                stockMinimo: stockMinimo,
                unidad: item.unidad_medida,
                fechaVencimiento: loteProximo?.fecha_venc?.split('T')[0],
                lote: loteProximo?.numero_lote,
                proveedor: loteProximo?.proveedor,
                estado: calcularEstado(stockActual, stockMinimo, fechaVencimiento),
            };
        });
    };

    // ============================================================
    // CARGAR INVENTARIO
    // ============================================================
    const cargarInventario = async () => {
        setCargando(true);
        setError(null);
        try {
            const response = await apiClient.get('/inventario');
            const itemsTransformados = transformarDatos(response.data);
            const nuevasAlertas = generarAlertas(response.data);
            
            setInventario(itemsTransformados);
            setAlertas(nuevasAlertas);
        } catch (err: any) {
            console.error('❌ Error al cargar inventario:', err);
            setError(err.response?.data?.mensaje || 'Error al cargar inventario');
        } finally {
            setCargando(false);
        }
    };

    // Cargar al iniciar
    useEffect(() => {
        cargarInventario();
    }, []);

    return {
        inventario,
        alertas,
        cargando,
        error,
        recargar: cargarInventario,
    };
};