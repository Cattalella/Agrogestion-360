import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ============================================================
// 📌 TIPOS
// ============================================================
export type ActividadConsumo = 'siembra' | 'mantenimiento' | 'alimentación' | 'vacunación';

export interface InsumoInventario {
    id_insumo: number;
    id: string;
    nombre_insumo: string;
    nombre: string;
    stockTotal: number;
    stock: number;
    unidad_medida: string;
    unidad: string;
    categoria?: string;
    stock_minimo?: number;
}

export interface RegistroConsumo {
    id: number;
    actividad: ActividadConsumo;
    fecha_consumo: string;
    id_insumo: number;
    nombreInsumo: string;
    cantidad: number;
    unidadMedida: string;
    responsable: string;
    observaciones: string;
}

export interface ConsumoStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
}

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useConsumoInsumos = () => {
    const [consumos, setConsumos] = useState<RegistroConsumo[]>([]);
    const [inventario, setInventario] = useState<InsumoInventario[]>([]);
    const [insumosCriticos, setInsumosCriticos] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    // ============================================================
    // CARGAR CONSUMOS
    // ============================================================
    const cargarConsumos = async () => {
        try {
            const response = await apiClient.get('/inventario/consumos');
            setConsumos(response.data);
            console.log('✅ Consumos cargados:', response.data.length);
        } catch (error) {
            console.error("❌ Error al cargar consumos:", error);
        }
    };

    // ============================================================
    // 🆕 CARGAR INVENTARIO DISPONIBLE
    // ============================================================
    const cargarInventario = async () => {
        try {
            const response = await apiClient.get('/inventario');
            // Transformar datos para que coincidan con el formulario
            const inventarioTransformado = response.data.map((item: any) => ({
                id: item.id_insumo.toString(),
                id_insumo: item.id_insumo,
                nombre: item.nombre_insumo,
                nombre_insumo: item.nombre_insumo,
                stock: item.stockTotal || 0,
                stockTotal: item.stockTotal || 0,
                unidad: item.unidad_medida,
                unidad_medida: item.unidad_medida,
                categoria: item.categoria,
                stock_minimo: item.stock_minimo || 0
            }));
            setInventario(inventarioTransformado);
            console.log('✅ Inventario cargado:', inventarioTransformado.length);
        } catch (error) {
            console.error("❌ Error al cargar inventario:", error);
        }
    };

    // ============================================================
    // 🆕 CARGAR INSUMOS CRÍTICOS (para Hero2)
    // ============================================================
    const cargarInsumosCriticos = async () => {
        try {
            const response = await apiClient.get('/inventario/criticos');
            setInsumosCriticos(response.data);
            console.log('✅ Insumos críticos cargados:', response.data.length);
        } catch (error) {
            console.error("❌ Error al cargar insumos críticos:", error);
        }
    };

    // Cargar al iniciar
    useEffect(() => {
        cargarConsumos();
        cargarInventario();
        cargarInsumosCriticos();
    }, []);

    // Refrescar al abrir modal
    useEffect(() => {
        if (isModalOpen) {
            cargarInventario();
        }
    }, [isModalOpen]);

    // ============================================================
    // 🆕 CALCULAR STATS PARA LA CARD
    // ============================================================
    const calcularStats = (): ConsumoStats => {
        // Total de consumos este mes
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        
        const consumosMes = consumos.filter(c => {
            const fecha = new Date(c.fecha_consumo);
            return fecha >= inicioMes;
        }).length;

        // Insumos bajo stock mínimo
        const bajoStock = inventario.filter(i => 
            i.stock_minimo && i.stock <= i.stock_minimo
        ).length;

        return {
            tipo1: "CONSUMOS ESTE MES",
            cantidad1: consumosMes,
            tipo2: "BAJO STOCK MÍNIMO",
            cantidad2: bajoStock
        };
    };

    // ============================================================
    // ABRIR / CERRAR MODAL
    // ============================================================
    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (v: 'lista' | 'formulario') => setVista(v);

    // ============================================================
    // REGISTRAR CONSUMO (CORREGIDO)
    // ============================================================
    const registrarConsumo = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            // Validar que id_insumo no sea null
            if (!datos.id_insumo) {
                throw new Error("Debes seleccionar un insumo");
            }

            const payload = {
                id_insumo: typeof datos.id_insumo === 'string' ? parseInt(datos.id_insumo) : datos.id_insumo,
                cantidad: typeof datos.cantidad === 'string' ? parseFloat(datos.cantidad) : datos.cantidad,
                actividad: datos.actividad,
                fecha_consumo: datos.fecha_consumo || new Date().toISOString().split('T')[0],
                id_responsable: datos.id_responsable,
                observaciones: datos.observaciones || datos.motivo || "",
                evidencia_fotografica: datos.evidencia_fotografica || null
            };

            console.log('📤 Enviando a backend (Consumo):', payload);
            
            const response = await apiClient.post('/inventario/consumo', payload);
            
            await cargarConsumos();
            await cargarInventario();
            await cargarInsumosCriticos();
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error: any) {
            console.error("❌ Error al registrar consumo:", error);
            const mensaje = error.response?.data?.mensaje || error.message || "Error al registrar consumo";
            alert(mensaje);
            return false;
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // 🆕 ACTUALIZAR CONSUMO
    // ============================================================
    const actualizarConsumo = async (id: number, datos: Partial<RegistroConsumo>) => {
        try {
            const respuesta = await apiClient.put(`/inventario/consumo/${id}`, datos);
            setConsumos(prev => prev.map(c => 
                c.id === id ? { ...c, ...datos } : c
            ));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar consumo:', error);
        }
    };

    // ============================================================
    // 🆕 ELIMINAR CONSUMO
    // ============================================================
    const eliminarConsumo = async (id: number) => {
        try {
            const respuesta = await apiClient.delete(`/inventario/consumo/${id}`);
            setConsumos(prev => prev.filter(c => c.id !== id));
            await cargarInventario();
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al eliminar consumo:', error);
        }
    };

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        consumos,
        inventario,
        insumosCriticos,
        cargando,
        loading: cargando,
        isModalOpen,
        vista,
        setVista,
        
        stats: calcularStats(),
        
        abrirModal,
        cerrarModal,
        cambiarVista,
        registrarConsumo,
        guardarConsumo: registrarConsumo,
        actualizarConsumo,
        eliminarConsumo,
        recargarLista: cargarConsumos,
    };
};