import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
export type EstadoInventario = 'Disponible' | 'Bajo Stock' | 'Agotado' | 'Vencido';

export interface ItemInventario {
    id: string | number;
    nombre: string;
    categoria: string;
    stockActual: number;
    stockMinimo: number;
    unidad: string;
    estadoFisico?: string;
    fechaVencimiento?: string;
}

export type AlertaInventario = {
    id: string;
    itemId: string | number;
    nombre: string;
    tipo: 'STOCK_BAJO' | 'VENCIMIENTO';
    mensaje: string;
    diasRestantes?: number;
};

export const useInventario = () => {
    const [inventario, setInventario] = useState<ItemInventario[]>([]);
    const [alertas, setAlertas] = useState<AlertaInventario[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchInventario = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/inventario');
            // Adaptar los datos del backend al formato del hook
            const mapeado = response.data.map((item: any) => ({
                id: item.id_insumo,
                nombre: item.nombre_insumo,
                categoria: item.categoria,
                stockActual: Number(item.stock_total || 0),
                stockMinimo: Number(item.stock_minimo || 0),
                unidad: item.unidad_medida,
                fechaVencimiento: item.proximo_vencimiento
            }));
            setInventario(mapeado);
        } catch (error) {
            console.error('❌ Error al cargar inventario:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventario();
    }, []);

    // Motor de Alertas
    useEffect(() => {
        const agendarAlertas = () => {
            const nuevasAlertas: AlertaInventario[] = [];
            const fechaActual = new Date();

            inventario.forEach(item => {
                // Alerta de Bajo Stock
                if (item.stockActual <= item.stockMinimo) {
                    nuevasAlertas.push({
                        id: `A-ST-${item.id}`,
                        itemId: item.id,
                        nombre: item.nombre,
                        tipo: 'STOCK_BAJO',
                        mensaje: item.stockActual === 0 
                            ? `¡Atención! ${item.nombre} se ha agotado.` 
                            : `El stock de ${item.nombre} (${item.stockActual}) está por debajo del mínimo permitido (${item.stockMinimo}).`
                    });
                }

                // Alerta de Vencimiento
                if (item.fechaVencimiento) {
                    const fechaVence = new Date(item.fechaVencimiento);
                    const diffMs = fechaVence.getTime() - fechaActual.getTime();
                    const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                    if (diasRestantes <= 30 && diasRestantes >= 0) {
                        nuevasAlertas.push({
                            id: `A-VC-${item.id}`,
                            itemId: item.id,
                            nombre: item.nombre,
                            tipo: 'VENCIMIENTO',
                            mensaje: `El insumo ${item.nombre} vencerá en ${diasRestantes} días.`,
                            diasRestantes
                        });
                    } else if (diasRestantes < 0) {
                        nuevasAlertas.push({
                            id: `A-VC-EXP-${item.id}`,
                            itemId: item.id,
                            nombre: item.nombre,
                            tipo: 'VENCIMIENTO',
                            mensaje: `¡Peligro! El insumo ${item.nombre} está VENCIDO desde hace ${Math.abs(diasRestantes)} días.`,
                            diasRestantes
                        });
                    }
                }
            });

            setAlertas(nuevasAlertas);
        };

        if (inventario.length > 0) agendarAlertas();
    }, [inventario]);

    const abrirModal = () => setIsModalOpen(true);
    const cerrarModal = () => setIsModalOpen(false);

    const inventarioConEstado = inventario.map(item => {
        let estadoCalculado: EstadoInventario = 'Disponible';
        if (item.stockActual === 0) estadoCalculado = 'Agotado';
        else if (item.stockActual <= item.stockMinimo) estadoCalculado = 'Bajo Stock';
        
        if (item.fechaVencimiento) {
            const fechaVence = new Date(item.fechaVencimiento);
            if (fechaVence.getTime() < new Date().getTime()) {
                estadoCalculado = 'Vencido';
            }
        }
        return { ...item, estado: estadoCalculado };
    });

    return {
        inventario: inventarioConEstado,
        alertas,
        loading,
        isModalOpen,
        abrirModal,
        cerrarModal,
        refetch: fetchInventario
    };
};
