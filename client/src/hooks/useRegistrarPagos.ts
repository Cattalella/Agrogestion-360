import { useState } from "react";

export const useRegistrarPagos = (initialData: any[] = []) => {
    const [listaPagos, setListaPagos] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    const abrirModal = () => setIsModalOpen(true);
    const cerrarModal = () => {
    setIsModalOpen(false);
    setVista('lista');
    };

    const guardarPago = (nuevoPago: any) => {
    const registro = {
        id: Date.now(),
      contabilizado: false, // Permite editar hasta que pase a contabilidad
        ...nuevoPago
    };
    setListaPagos([registro, ...listaPagos]);
    setVista('lista');
    };

    const anularPago = (id: number, justificacion: string) => {
    setListaPagos(prev => prev.map(pago => 
        pago.id === id 
        ? { ...pago, estado: 'Anulado', concepto: `${pago.concepto} (ANULADO: ${justificacion})` } 
        : pago
    ));
    };

    return {
    listaPagos, isModalOpen, vista, abrirModal, cerrarModal, setVista, guardarPago, anularPago
    };
};