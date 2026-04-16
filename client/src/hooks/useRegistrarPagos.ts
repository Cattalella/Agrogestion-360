import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ============================================================
// 📌 TIPOS — RI. 8.1.1
// ============================================================
export interface Pago {
    id_pago: number;
    id_trabajador: number;
    id_trabajo?: number;
    fecha_pago: string;
    monto_total: number;
    concepto: string;
    estado_pago: string;
    firma_url?: string;
    justificacion_anulacion?: string;
    Trabajador?: { nombre_completo: string };
}

export interface PagosStats {
    tipo1: string;
    cantidad1: string | number;
    tipo2: string;
    cantidad2: number;
}

type Vista = 'lista' | 'formulario';

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useRegistrarPagos = () => {
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [trabajadores, setTrabajadores] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [pagoAEditar, setPagoAEditar] = useState<Pago | null>(null);

    // ============================================================
    // CARGAR PAGOS
    // ============================================================
    const cargarPagos = async () => {
        setCargando(true);
        try {
            const response = await apiClient.get('/trabajadores/pagos');
            setPagos(response.data);
            console.log('✅ Pagos cargados:', response.data.length);
        } catch (error) {
            console.error("❌ Error al cargar pagos:", error);
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // 🆕 CARGAR TRABAJADORES ACTIVOS
    // ============================================================
    const cargarTrabajadores = async () => {
        try {
            const response = await apiClient.get('/trabajadores');
            const activos = response.data.filter((t: any) => t.estado === 'Activo');
            setTrabajadores(activos);
            console.log('✅ Trabajadores activos cargados:', activos.length);
        } catch (error) {
            console.error("❌ Error al cargar trabajadores:", error);
        }
    };

    // Cargar al iniciar
    useEffect(() => {
        cargarPagos();
        cargarTrabajadores();
    }, []);

    // Refrescar al abrir modal
    useEffect(() => {
        if (isModalOpen) {
            cargarPagos();
            cargarTrabajadores();
        }
    }, [isModalOpen]);

    // ============================================================
    // 🆕 CALCULAR STATS PARA LA CARD
    // ============================================================
    const calcularStats = (): PagosStats => {
        // Calcular nómina total (suma de todos los pagos NO anulados)
        const pagosValidos = pagos.filter(p => 
            p.estado_pago !== 'Anulado' && !p.justificacion_anulacion
        );
        
        const totalNomina = pagosValidos.reduce((sum, p) => sum + (p.monto_total || 0), 0);
        
        // Formatear como moneda
        const totalFormateado = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(totalNomina);

        // Contar pagos pendientes (No pagado + Pendiente de firma)
        const pendientes = pagos.filter(p => 
            p.estado_pago === 'No pagado' || p.estado_pago === 'Pendiente de firma'
        ).length;

        return {
            tipo1: "NÓMINA TOTAL",
            cantidad1: totalFormateado,
            tipo2: "PENDIENTES",
            cantidad2: pendientes
        };
    };

    // ============================================================
    // ABRIR / CERRAR MODAL
    // ============================================================
    const abrirModal = () => {
        setVista('lista');
        setPagoAEditar(null);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setPagoAEditar(null);
        setVista('lista');
    };

    const cambiarVista = (v: Vista) => setVista(v);

    // ============================================================
    // GUARDAR PAGO
    // ============================================================
    const guardarPago = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                id_trabajador: parseInt(datos.id_trabajador),
                tipo_trabajo: datos.tipo_trabajo,
                fecha_pago: datos.fecha_pago,
                monto_total: datos.monto_total,
                concepto: datos.concepto,
                estado: datos.estado || 'No pagado'
            };

            console.log('📤 Enviando a backend (Pago):', datosParaBackend);
            
            await apiClient.post('/trabajadores/pagos', datosParaBackend);
            
            await cargarPagos();
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error: any) {
            console.error("❌ Error al registrar pago:", error);
            alert(error.response?.data?.mensaje || "Error al registrar pago");
            return false;
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // 🆕 ACTUALIZAR PAGO
    // ============================================================
    const actualizarPago = async (id: number, datos: Partial<Pago>) => {
        try {
            const respuesta = await apiClient.put(`/trabajadores/pagos/${id}`, datos);
            setPagos(prev => prev.map(p => 
                p.id_pago === id ? { ...p, ...datos } : p
            ));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar pago:', error);
        }
    };

    // ============================================================
    // ANULAR PAGO
    // ============================================================
    const anularPago = async (id: number, justificacion: string) => {
        if (!justificacion.trim()) {
            alert("Debes ingresar una justificación para anular el pago.");
            return false;
        }
        
        try {
            await apiClient.patch(`/trabajadores/pagos/${id}/anular`, { justificacion });
            await cargarPagos();
            return true;
        } catch (error) {
            console.error("❌ Error al anular pago:", error);
            return false;
        }
    };

    // ============================================================
    // 🆕 ELIMINAR PAGO (solo si no está contabilizado)
    // ============================================================
    const eliminarPago = async (id: number) => {
        try {
            const respuesta = await apiClient.delete(`/trabajadores/pagos/${id}`);
            setPagos(prev => prev.filter(p => p.id_pago !== id));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al eliminar pago:', error);
        }
    };

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        listaPagos: pagos,
        pagos,
        trabajadores,  // 🆕 Para el selector del formulario
        cargando,
        loading: cargando,  // Alias para compatibilidad
        isModalOpen,
        vista,
        pagoAEditar,
        setPagoAEditar,
        setVista,
        cambiarVista,
        
        // 🆕 Stats para la card
        stats: calcularStats(),
        
        abrirModal,
        cerrarModal,
        guardarPago,
        actualizarPago,
        anularPago,
        eliminarPago,
        recargarLista: cargarPagos,
    };
};