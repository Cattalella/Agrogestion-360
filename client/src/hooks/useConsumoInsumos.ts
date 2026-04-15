import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

export type ActividadConsumo = 'siembra' | 'mantenimiento' | 'alimentación' | 'vacunación';
export type EstadoConsumo = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface RegistroConsumo {
    id: number;
    actividadSeleccionada: ActividadConsumo;
    fechaConsumo: string;
    idInsumo: number;
    nombreInsumo: string;
    cantidad: number;
    unidadMedida: string;
    responsable: string;
    observaciones: string;
}

export const useConsumoInsumos = () => {
    const [consumos, setConsumos] = useState<RegistroConsumo[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    const fetchConsumos = async () => {
        // En una implementación real, podríamos tener un GET /inventario/consumos
        // Por ahora, si no existe el endpoint, mantenemos el estado local o manejamos el error
        try {
            // const response = await apiClient.get('/inventario/consumos');
            // setConsumos(response.data);
        } catch (error) {
            console.error("Error al cargar consumos:", error);
        }
    };

    useEffect(() => {
        if (isModalOpen) fetchConsumos();
    }, [isModalOpen]);

    const registrarConsumo = async (datos: any) => {
        setLoading(true);
        try {
            const payload = {
                id_insumo: datos.idInsumo,
                cantidad: datos.cantidad,
                actividad: datos.actividadSeleccionada,
                observaciones: datos.motivo || datos.observaciones,
            };

            await apiClient.post('/inventario/consumo', payload);
            await fetchConsumos();
            setVista('lista');
            return true;
        } catch (error) {
            console.error("Error al registrar consumo:", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = () => setIsModalOpen(true);
    const cerrarModal = () => setIsModalOpen(false);
    const cambiarVista = (v: 'lista' | 'formulario') => setVista(v);

    return {
        consumos,
        loading,
        isModalOpen,
        vista,
        setVista,
        abrirModal,
        cerrarModal,
        cambiarVista,
        registrarConsumo,
    };
};
