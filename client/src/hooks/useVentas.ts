import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

export interface Venta {
    id_venta: number;
    id_animal: number;
    fecha_venta: string;
    peso_venta: number;
    precio_total: number;
    comprador: string;
    num_factura?: string;
    metodo_pago: string;
    observaciones?: string;
    Animal?: {
        codigo_local: string;
        Especie: { nombre: string };
    };
}

export const useVentas = () => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cargando, setCargando] = useState(false);

    const cargarVentas = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/ventas');
            setVentas(respuesta.data);
        } catch (error) {
            console.error("Error al cargar ventas:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            cargarVentas();
        }
    }, [isModalOpen]);

    const abrirModal = () => setIsModalOpen(true);
    const cerrarModal = () => setIsModalOpen(false);

    const registrarVenta = async (datos: any) => {
        setCargando(true);
        try {
            await apiClient.post('/ventas', {
                id_animal: parseInt(datos.id_animal),
                fecha_venta: datos.fecha_venta,
                peso_venta: parseFloat(datos.peso_total),
                precio_total: parseFloat(datos.precio_total),
                comprador: datos.comprador,
                num_factura: datos.num_factura,
                metodo_pago: datos.metodo_pago,
                observaciones: datos.observaciones
            });
            await cargarVentas();
            cerrarModal();
            return true;
        } catch (error: any) {
            console.error("Error al registrar venta:", error);
            alert(error.response?.data?.mensaje || "Error al registrar venta");
            return false;
        } finally {
            setCargando(false);
        }
    };

    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    const cambiarVista = (nueva: 'lista' | 'formulario') => setVista(nueva);

    return {
        ventas,
        listaVentas: ventas, // Alias
        isModalOpen,
        vista,
        cargando,
        abrirModal,
        cerrarModal,
        cambiarVista,
        registrarVenta,
        guardarVenta: registrarVenta, // Alias
    };
};