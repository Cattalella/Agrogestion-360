import { useState } from 'react';

interface Vacuna {
    id: number;
    animal: string;
    vacuna: string;
    fecha: string;
    refuerzo: string;
}

export const useVacunas = (listaInicial: Vacuna[]) => {
    const [listaVacunas, setListaVacunas] = useState<Vacuna[]>(listaInicial);
    const [sugerenciaId, setSugerenciaId] = useState<string>(() => {
        const nextId = listaInicial.length + 1;
        return `VAC-${nextId}`;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    const abrirModal = () => setIsModalOpen(true);
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => setVista(nuevaVista);

    const guardarVacuna = (datos: any) => {
        console.log("Guardando vacuna...", datos);
        setIsModalOpen(false);
        setVista('lista');
    };

    return {
        listaVacunas,
        sugerenciaId,
        isModalOpen,
        vista,
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarVacuna
    };
};