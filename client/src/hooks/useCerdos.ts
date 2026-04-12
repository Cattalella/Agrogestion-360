import { useState } from 'react';

interface Cerdo {
    id: number;
    local: string;
    oficial: string;
    sexo: string;
    estado: string;
    foto?: string;
}

export const useCerdos = (listaInicial: Cerdo[]) => {
    const [listaCerdos, setListaCerdos] = useState<Cerdo[]>(listaInicial);
    const [categoriaCerdo, setCategoriaCerdo] = useState("HEMBRA");
    const [sugerenciaId, setSugerenciaId] = useState<string>(() => {
        const nextId = listaInicial.length + 1;
        return `C-${nextId.toString().padStart(2, '0')}`;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    const abrirModal = () => setIsModalOpen(true);
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => setVista(nuevaVista);

    const guardarCerdo = (datos: any, cerrar: boolean) => {
        console.log("Guardando cerdo...", datos);
        
        const nuevoId = listaCerdos.length + 1;
        setSugerenciaId(`C-${nuevoId.toString().padStart(2, '0')}`);
        
        if (cerrar) {
            setIsModalOpen(false);
            setVista('lista');
        }
    };

    return {
        listaCerdos,
        categoriaCerdo,
        setCategoriaCerdo,
        sugerenciaId,
        isModalOpen,
        vista,
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarCerdo
    };
};