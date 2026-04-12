import { useState } from 'react';

interface Venta {
    id: number;
    animal: string;
    cliente: string;
    fecha: string;
    monto: string;
}

export const useVentas = (listaInicial: Venta[]) => {
    const [listaVentas, setListaVentas] = useState<Venta[]>(listaInicial);
    const [sugerenciaId, setSugerenciaId] = useState<string>(() => {
        const nextId = listaInicial.length + 1;
        return `VENTA-${nextId}`;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    const abrirModal = () => setIsModalOpen(true);
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => setVista(nuevaVista);

    const guardarVenta = (datos: any) => {
        console.log("Guardando venta...", datos);
        setIsModalOpen(false);
        setVista('lista');
    };

    return {
        listaVentas,
        sugerenciaId,
        isModalOpen,
        vista,
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarVenta
    };
};