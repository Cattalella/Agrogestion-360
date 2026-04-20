import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ============================================================
// 📌 INTERFACES — alineadas con schema TrabajoRealizado
// ============================================================
export interface TrabajoRealizado {
    id_trabajo: number;
    id_trabajador: number;
    categoria_trabajo: string;
    tipo_actividad: string;
    fecha_inicio: string;
    fecha_fin: string;
    duracion_horas: number;
    evidencia_url: string;
    observaciones?: string;
    Trabajador?: { nombre_completo: string };
}

export interface TrabajoStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
}

type Vista = 'lista' | 'formulario';

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useTrabajoRealizado = () => {
    const [trabajos, setTrabajos] = useState<TrabajoRealizado[]>([]);
    const [cargando, setCargando] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [trabajoAEditar, setTrabajoAEditar] = useState<TrabajoRealizado | null>(null);
    const [trabajadores, setTrabajadores] = useState<any[]>([]);

    // ============================================================
    // CARGAR TRABAJOS
    // ============================================================
    const cargarTrabajos = async () => {
        setCargando(true);
        try {
            const response = await apiClient.get('/trabajadores/trabajos');
            setTrabajos(response.data);
        } catch (error) {
            console.error("❌ Error al cargar trabajos:", error);
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // CARGAR TRABAJADORES ACTIVOS
    // ============================================================
    const cargarTrabajadores = async () => {
        try {
            const response = await apiClient.get('/trabajadores');
            const activos = response.data.filter((t: any) => t.estado === 'Activo');
            setTrabajadores(activos);
        } catch (error) {
            console.error("❌ Error al cargar trabajadores:", error);
        }
    };

    useEffect(() => {
        cargarTrabajos();
        cargarTrabajadores();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            cargarTrabajos();
            cargarTrabajadores();
        }
    }, [isModalOpen]);

    // ============================================================
    // STATS — usa duracion_horas del schema
    // ============================================================
    const calcularStats = (): TrabajoStats => {
        const horasTotales = trabajos.reduce((total, t) => {
            return total + (Number(t.duracion_horas) || 0);
        }, 0);

        const tareasCompletadas = trabajos.length;

        return {
            tipo1: "HORAS TOTALES",
            cantidad1: Math.round(horasTotales),
            tipo2: "TRABAJOS REGISTRADOS",
            cantidad2: tareasCompletadas
        };
    };

    // ============================================================
    // ABRIR / CERRAR MODAL
    // ============================================================
    const abrirModal = () => {
        setVista('lista');
        setTrabajoAEditar(null);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setTrabajoAEditar(null);
        setVista('lista');
    };

    const cambiarVista = (v: Vista) => setVista(v);

    const abrirEdicion = (trabajo: TrabajoRealizado) => {
        setTrabajoAEditar(trabajo);
        setVista('formulario');
    };

    // ============================================================
    // REGISTRAR / ACTUALIZAR TRABAJO
    // ============================================================
    const registrarTrabajo = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                id_trabajador: parseInt(datos.id_trabajador),
                categoria_trabajo: datos.categoria_trabajo,
                tipo_actividad: datos.tipo_actividad,
                fecha_inicio: datos.fecha_inicio,
                fecha_fin: datos.fecha_fin,
                duracion_horas: datos.duracion_horas,
                evidencia_url: datos.evidencia_url,
                observaciones: datos.observaciones || null,
            };

            if (trabajoAEditar) {
                await apiClient.put(`/trabajadores/trabajos/${trabajoAEditar.id_trabajo}`, datosParaBackend);
            } else {
                await apiClient.post('/trabajadores/trabajos', datosParaBackend);
            }

            await cargarTrabajos();

            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error: any) {
            console.error("❌ Error al registrar trabajo:", error);
            alert(error.response?.data?.mensaje || "Error al registrar trabajo");
            return false;
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // ELIMINAR TRABAJO — RN.8.1.2: debe estar justificado
    // ============================================================
    const eliminarTrabajo = async (id: number) => {
        try {
            await apiClient.delete(`/trabajadores/trabajos/${id}`);
            setTrabajos(prev => prev.filter(t => t.id_trabajo !== id));
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar trabajo:', error);
            return false;
        }
    };

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        trabajos,
        listaTrabajos: trabajos,
        trabajadores,
        cargando,
        loading: cargando,
        isModalOpen,
        vista,
        trabajoAEditar,
        setVista,
        cambiarVista,
        stats: calcularStats(),
        abrirModal,
        cerrarModal,
        abrirEdicion,
        registrarTrabajo,
        guardarTrabajo: registrarTrabajo,
        eliminarTrabajo,
        recargarLista: cargarTrabajos,
    };
};