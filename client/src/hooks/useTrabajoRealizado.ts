import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ============================================================
// 📌 INTERFACES
// ============================================================
export interface TrabajoRealizado {
    id_trabajo: number;
    id_trabajador: number;
    id_animal?: number;
    id_insumo?: number;
    fecha_inicio: string;
    fecha_fin?: string;
    descripcion: string;
    monto_pago?: number;
    estado_trabajo: string;
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
    
    // 🆕 Lista de trabajadores para el selector
    const [trabajadores, setTrabajadores] = useState<any[]>([]);

    // ============================================================
    // CARGAR TRABAJOS
    // ============================================================
    const cargarTrabajos = async () => {
        setCargando(true);
        try {
            const response = await apiClient.get('/trabajadores/trabajos');
            setTrabajos(response.data);
            console.log('✅ Trabajos cargados:', response.data.length);
        } catch (error) {
            console.error("❌ Error al cargar trabajos:", error);
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
        cargarTrabajos();
        cargarTrabajadores();
    }, []);

    // Refrescar al abrir modal
    useEffect(() => {
        if (isModalOpen) {
            cargarTrabajos();
            cargarTrabajadores();
        }
    }, [isModalOpen]);

    // ============================================================
    // 🆕 CALCULAR STATS PARA LA CARD
    // ============================================================
    const calcularStats = (): TrabajoStats => {
        // Calcular horas totales
        const horasTotales = trabajos.reduce((total, t) => {
            if (t.fecha_inicio && t.fecha_fin) {
                const inicio = new Date(t.fecha_inicio);
                const fin = new Date(t.fecha_fin);
                const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                return total + (horas > 0 ? horas : 0);
            }
            return total;
        }, 0);

        // Contar tareas completadas
        const tareasCompletadas = trabajos.filter(t => 
            t.estado_trabajo === 'Completado' || t.estado_trabajo === 'Finalizado'
        ).length;

        return {
            tipo1: "HORAS TOTALES",
            cantidad1: Math.round(horasTotales),
            tipo2: "TAREAS COMPLETAS",
            cantidad2: tareasCompletadas
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

    const cambiarVista = (v: Vista) => setVista(v);

    // ============================================================
    // REGISTRAR TRABAJO
    // ============================================================
    const registrarTrabajo = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                id_mantenimiento: datos.id_mantenimiento,
                id_trabajador: parseInt(datos.id_trabajador),
                categoria_trabajo: datos.categoria_trabajo,
                tipo_actividad: datos.tipo_actividad,
                fecha_inicio: datos.fecha_inicio,
                fecha_fin: datos.fecha_fin,
                evidencia_fotografica: datos.evidencia_fotografica,
                observaciones: datos.observaciones || null
            };

            console.log('📤 Enviando a backend (Trabajo):', datosParaBackend);
            
            await apiClient.post('/trabajadores/trabajos', datosParaBackend);
            
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
    // 🆕 ACTUALIZAR TRABAJO
    // ============================================================
    const actualizarTrabajo = async (id: number, datos: Partial<TrabajoRealizado>) => {
        try {
            const respuesta = await apiClient.put(`/trabajadores/trabajos/${id}`, datos);
            setTrabajos(prev => prev.map(t => 
                t.id_trabajo === id ? { ...t, ...datos } : t
            ));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar trabajo:', error);
        }
    };

    // ============================================================
    // 🆕 ELIMINAR TRABAJO
    // ============================================================
    const eliminarTrabajo = async (id: number) => {
        try {
            const respuesta = await apiClient.delete(`/trabajadores/trabajos/${id}`);
            setTrabajos(prev => prev.filter(t => t.id_trabajo !== id));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al eliminar trabajo:', error);
        }
    };

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        trabajos,
        listaTrabajos: trabajos,
        trabajadores,  // 🆕 Para el selector del formulario
        cargando,
        loading: cargando,  // Alias para compatibilidad
        isModalOpen,
        vista,
        setVista,
        cambiarVista,
        
        // 🆕 Stats para la card
        stats: calcularStats(),
        
        abrirModal,
        cerrarModal,
        registrarTrabajo,
        guardarTrabajo: registrarTrabajo,  // Alias
        actualizarTrabajo,
        eliminarTrabajo,
        recargarLista: cargarTrabajos,
    };
};