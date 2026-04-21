import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ============================================================
// 📌 TIPOS — RI. 8.1.1 / Schema PagoTrabajador
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
    TrabajoRealizado?: { tipo_actividad: string };
}

export interface TrabajoRealizado {
    id_trabajo: number;
    id_trabajador: number;
    tipo_actividad: string;
    fecha_inicio: string;
    fecha_fin: string;
    categoria_trabajo?: string;
    duracion_horas?: number;
    observaciones?: string;
    evidencia_url?: string;
    Trabajador?: { nombre_completo: string; id_trabajador: number };
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
    const [trabajosRealizados, setTrabajosRealizados] = useState<TrabajoRealizado[]>([]);
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
    // CARGAR TRABAJADORES ACTIVOS (CORREGIDO: acepta 'activo' y 'Activo')
    // ============================================================
    const cargarTrabajadores = async () => {
        try {
            const response = await apiClient.get('/trabajadores');
            // 🔥 CORREGIDO: usa toLowerCase() para aceptar ambos formatos
            const activos = response.data.filter((t: any) => t.estado?.toLowerCase() === 'activo');
            setTrabajadores(activos);
            console.log('✅ Trabajadores activos cargados:', activos.length);
        } catch (error) {
            console.error("❌ Error al cargar trabajadores:", error);
        }
    };

    // ============================================================
    // 🆕 CARGAR TRABAJOS REALIZADOS
    // ============================================================
    const cargarTrabajosRealizados = async () => {
        try {
            const response = await apiClient.get('/trabajadores/trabajos');
            setTrabajosRealizados(response.data);
            console.log('✅ Trabajos realizados cargados:', response.data.length);
        } catch (error) {
            console.error("❌ Error al cargar trabajos realizados:", error);
        }
    };

    useEffect(() => {
        cargarPagos();
        cargarTrabajadores();
        cargarTrabajosRealizados();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            cargarPagos();
            cargarTrabajadores();
            cargarTrabajosRealizados();
        }
    }, [isModalOpen]);

    // ============================================================
    // STATS PARA LA CARD
    // ============================================================
    const calcularStats = (): PagosStats => {
        const pagosValidos = pagos.filter(p =>
            p.estado_pago !== 'Anulado' && !p.justificacion_anulacion
        );

        const totalNomina = pagosValidos.reduce((sum, p) => sum + (p.monto_total || 0), 0);

        const totalFormateado = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(totalNomina);

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
    // ABRIR EDICIÓN
    // ============================================================
    const abrirEdicion = (pago: Pago) => {
        setPagoAEditar(pago);
        setVista('formulario');
    };

    // ============================================================
    // GUARDAR / ACTUALIZAR PAGO
    // ============================================================
    const guardarPago = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            // Caso anulación
            if (datos.accion === 'anular' && datos.id_pago) {
                await apiClient.patch(`/trabajadores/pagos/${datos.id_pago}/anular`, {
                    justificacion: datos.justificacion_anulacion
                });
                await cargarPagos();
                cerrarModal();
                return true;
            }

            // Caso edición
            if (pagoAEditar) {
                const datosActualizar = {
                    fecha_pago: datos.fecha_pago,
                    monto_total: datos.monto_total,
                    concepto: datos.concepto,
                    estado_pago: datos.estado_pago,
                };
                await apiClient.put(`/trabajadores/pagos/${pagoAEditar.id_pago}`, datosActualizar);
            } else {
                // Caso creación
                const datosParaBackend = {
                    id_trabajador: datos.id_trabajador,
                    id_trabajo: datos.id_trabajo || null,
                    fecha_pago: datos.fecha_pago,
                    monto_total: datos.monto_total,
                    concepto: datos.concepto,
                    estado_pago: datos.estado_pago || 'No pagado',
                };
                await apiClient.post('/trabajadores/pagos', datosParaBackend);
            }

            await cargarPagos();

            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error: any) {
            console.error("❌ Error al guardar pago:", error);
            alert(error.response?.data?.mensaje || "Error al guardar pago");
            return false;
        } finally {
            setCargando(false);
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
    // RETORNAR
    // ============================================================
    return {
        listaPagos: pagos,
        pagos,
        trabajadores,
        trabajosRealizados,  // 🆕 AGREGADO
        cargando,
        loading: cargando,
        isModalOpen,
        vista,
        pagoAEditar,
        setPagoAEditar,
        setVista,
        cambiarVista,
        stats: calcularStats(),
        abrirModal,
        cerrarModal,
        abrirEdicion,
        guardarPago,
        anularPago,
        recargarLista: cargarPagos,
    };
};