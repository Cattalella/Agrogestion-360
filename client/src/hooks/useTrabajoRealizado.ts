import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ─────────────────────────────────────────
// TIPOS — RI. 8.1.2
// ─────────────────────────────────────────
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

type Vista = 'lista' | 'formulario';

export const useTrabajoRealizado = () => {
    const [trabajos, setTrabajos] = useState<TrabajoRealizado[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');

    const cargarTrabajos = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/trabajadores/trabajos');
            setTrabajos(response.data);
        } catch (error) {
            console.error("Error al cargar trabajos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) cargarTrabajos();
    }, [isModalOpen]);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (v: Vista) => setVista(v);

    const registrarTrabajo = async (datos: any) => {
        setLoading(true);
        try {
            await apiClient.post('/trabajadores/trabajos', datos);
            await cargarTrabajos();
            setVista('lista');
            return true;
        } catch (error) {
            console.error("Error al registrar trabajo:", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        trabajos,
        loading,
        isModalOpen,
        vista,
        setVista,
        cambiarVista,
        abrirModal,
        cerrarModal,
        registrarTrabajo,
    };
};