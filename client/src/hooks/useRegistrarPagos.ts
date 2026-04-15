import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ─────────────────────────────────────────
// TIPOS — RI. 8.1.1
// ─────────────────────────────────────────
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

type Vista = 'lista' | 'formulario';

export const useRegistrarPagos = () => {
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [pagoAEditar, setPagoAEditar] = useState<Pago | null>(null);

    const cargarPagos = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/trabajadores/pagos');
            setPagos(response.data);
        } catch (error) {
            console.error("Error al cargar pagos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) cargarPagos();
    }, [isModalOpen]);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setPagoAEditar(null);
    };

    const cambiarVista = (v: Vista) => setVista(v);

    const guardarPago = async (datos: any, cerrar: boolean = false) => {
        setLoading(true);
        try {
            await apiClient.post('/trabajadores/pagos', datos);
            await cargarPagos();
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error) {
            console.error("Error al registrar pago:", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const anularPago = async (id: number, justificacion: string) => {
        if (!justificacion.trim()) {
            alert("Debes ingresar una justificación para anular el pago.");
            return;
        }
        
        try {
            await apiClient.patch(`/trabajadores/pagos/${id}/anular`, { justificacion });
            await cargarPagos();
        } catch (error) {
            console.error("Error al anular pago:", error);
        }
    };

    return {
        listaPagos: pagos,
        loading,
        isModalOpen,
        vista,
        pagoAEditar,
        setVista,
        cambiarVista,
        abrirModal,
        cerrarModal,
        guardarPago,
        anularPago,
    };
};