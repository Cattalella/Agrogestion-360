import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ============================================================
// 📌 TIPOS — RI. 8.1.3
// ============================================================
export interface Trabajador {
    id_trabajador: number;
    nombre_completo: string;
    tipo_documento: string;
    num_documento: string;
    tipo_trabajo: string;
    telefono?: string;
    telefono_familiar?: string;
    direccion?: string;
    estado: string;
    fecha_ingreso: string;
    observaciones?: string;
}

export interface TrabajadoresStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
}

type Vista = 'lista' | 'formulario';

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useNuevoTrabajador = () => {
    const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
    const [cargando, setCargando] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [trabajadorAEditar, setTrabajadorAEditar] = useState<Trabajador | null>(null);

    // ============================================================
    // CARGAR TRABAJADORES
    // ============================================================
    const cargarTrabajadores = async () => {
        setCargando(true);
        try {
            const response = await apiClient.get('/trabajadores');
            setTrabajadores(response.data);
            console.log('✅ Trabajadores cargados:', response.data.length);
        } catch (error) {
            console.error("❌ Error al cargar trabajadores:", error);
        } finally {
            setCargando(false);
        }
    };

    // Cargar al iniciar
    useEffect(() => {
        cargarTrabajadores();
    }, []);

    // Refrescar al abrir modal
    useEffect(() => {
        if (isModalOpen) {
            cargarTrabajadores();
        }
    }, [isModalOpen]);

    // ============================================================
    // 🆕 CALCULAR STATS PARA LA CARD
    // ============================================================
    const calcularStats = (): TrabajadoresStats => {
        const activos = trabajadores.filter(t => t.estado === 'Activo').length;
        const inactivos = trabajadores.filter(t => t.estado === 'Inactivo').length;

        return {
            tipo1: "ACTIVOS",
            cantidad1: activos,
            tipo2: "POR CONTRATAR",
            cantidad2: 0  // Se puede calcular según necesidades futuras
        };
    };

    // ============================================================
    // ABRIR / CERRAR MODAL
    // ============================================================
    const abrirModal = () => {
        setVista('lista');
        setTrabajadorAEditar(null);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setTrabajadorAEditar(null);
        setVista('lista');
    };

    const cambiarVista = (v: Vista) => setVista(v);

    // ============================================================
    // GUARDAR TRABAJADOR
    // ============================================================
    const guardarTrabajador = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                id_trabajador: datos.id_trabajador,
                nombre_completo: datos.nombre_completo,
                tipo_documento: datos.tipo_documento,
                num_documento: datos.numero_documento,
                tipo_trabajo: datos.tipo_trabajo,
                telefono: datos.telefono || null,
                telefono_familiar: datos.telefono_familiar || null,
                direccion: datos.direccion || null,
                estado: datos.estado || 'Activo',
                fecha_ingreso: datos.fecha_ingreso,
                observaciones: datos.observaciones || null
            };

            console.log('📤 Datos a enviar (Trabajador):', datosParaBackend);

            if (trabajadorAEditar) {
                await apiClient.patch(`/trabajadores/${trabajadorAEditar.id_trabajador}`, datosParaBackend);
            } else {
                await apiClient.post('/trabajadores', datosParaBackend);
            }
            
            await cargarTrabajadores();
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
                setTrabajadorAEditar(null);
            }
            return true;
        } catch (error: any) {
            console.error("❌ Error al guardar trabajador:", error);
            
            // 🆕 Manejar error de clave compuesta (documento duplicado para mismo tipo)
            if (error.response?.status === 409 || error.response?.data?.mensaje?.includes('duplicado')) {
                alert("Ya existe un trabajador con ese tipo y número de documento.");
            } else {
                alert(error.response?.data?.mensaje || "Error al guardar trabajador");
            }
            return false;
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // EDITAR TRABAJADOR
    // ============================================================
    const editarTrabajador = (trabajador: Trabajador) => {
        setTrabajadorAEditar(trabajador);
        setVista('formulario');
    };

    // ============================================================
    // ELIMINAR TRABAJADOR (LÓGICO)
    // ============================================================
    const eliminarTrabajador = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este trabajador? Su historial se conservará.')) return;
        
        setCargando(true);
        try {
            await apiClient.post(`/trabajadores/${id}/eliminar`);
            await cargarTrabajadores();
            return true;
        } catch (error) {
            console.error("❌ Error al eliminar trabajador:", error);
            return false;
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // 🆕 CAMBIAR ESTADO (ACTIVAR/INACTIVAR)
    // ============================================================
    const cambiarEstado = async (id: number, nuevoEstado: string) => {
        try {
            await apiClient.patch(`/trabajadores/${id}/estado`, { estado: nuevoEstado });
            await cargarTrabajadores();
            return true;
        } catch (error) {
            console.error("❌ Error al cambiar estado:", error);
            return false;
        }
    };

    // ============================================================
    // FILTROS
    // ============================================================
    const trabajadoresActivos = trabajadores.filter(t => t.estado === 'Activo');
    const trabajadoresVisibles = trabajadores;

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        trabajadores,
        listaTrabajadores: trabajadores,
        trabajadoresVisibles,
        trabajadoresActivos,
        cargando,
        loading: cargando,  // Alias para compatibilidad
        isModalOpen,
        vista,
        trabajadorAEditar,
        setTrabajadorAEditar,
        setVista,
        cambiarVista,
        
        // 🆕 Stats para la card
        stats: calcularStats(),
        
        abrirModal,
        cerrarModal,
        guardarTrabajador,
        editarTrabajador,
        eliminarTrabajador,
        cambiarEstado,
        recargarLista: cargarTrabajadores,
    };
};