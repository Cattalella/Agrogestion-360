import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ─────────────────────────────────────────
// TIPOS — RI. 8.1.3
// ─────────────────────────────────────────
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

type Vista = 'lista' | 'formulario';

export const useNuevoTrabajador = () => {
    const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [trabajadorAEditar, setTrabajadorAEditar] = useState<Trabajador | null>(null);
    const [loading, setLoading] = useState(false);

    const cargarTrabajadores = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/trabajadores');
            setTrabajadores(response.data);
        } catch (error) {
            console.error("Error al cargar trabajadores:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) cargarTrabajadores();
    }, [isModalOpen]);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setTrabajadorAEditar(null);
    };

    const cambiarVista = (v: Vista) => setVista(v);

    const guardarTrabajador = async (datos: any, cerrar: boolean = false) => {
        setLoading(true);
        try {
            if (trabajadorAEditar) {
                await apiClient.patch(`/trabajadores/${trabajadorAEditar.id_trabajador}`, datos);
            } else {
                await apiClient.post('/trabajadores', datos);
            }
            
            await cargarTrabajadores();
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
                setTrabajadorAEditar(null);
            }
            return true;
        } catch (error) {
            console.error("Error al guardar trabajador:", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const editarTrabajador = (trabajador: Trabajador) => {
        setTrabajadorAEditar(trabajador);
        setVista('formulario');
    };

    const eliminarTrabajador = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este trabajador?')) return;
        
        try {
            await apiClient.post(`/trabajadores/${id}/eliminar`);
            await cargarTrabajadores();
        } catch (error) {
            console.error("Error al eliminar trabajador:", error);
        }
    };

    // Filtros lógicos
    const trabajadoresActivos = trabajadores.filter(t => t.estado === 'Activo');
    const trabajadoresVisibles = trabajadores; // El backend ya filtra los eliminados lógicamente

    return {
        trabajadores,
        trabajadoresVisibles,
        trabajadoresActivos,
        loading,
        isModalOpen,
        vista,
        trabajadorAEditar,
        setVista,
        cambiarVista,
        abrirModal,
        cerrarModal,
        guardarTrabajador,
        editarTrabajador,
        eliminarTrabajador,
    };
};