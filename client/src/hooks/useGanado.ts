import { useState, useEffect } from 'react';

interface Animal {
    id: number;
    oficial: string;
    local: string;
    sexo: string;
    estado: string;
}

export const useGanado = (listaInicial: Animal[]) => {
    const [listaGanado, setListaGanado] = useState<Animal[]>(listaInicial);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("VA");
    const [sugerenciaId, setSugerenciaId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    useEffect(() => {
        const registrosMismoTipo = listaGanado.filter(a => 
            a.local.startsWith(categoriaSeleccionada)
        );

        const ultimoNumero = registrosMismoTipo.reduce((max, curr) => {
            const partes = curr.local.split('-');
            const num = partes.length > 1 ? parseInt(partes[1]) : 0;
            return !isNaN(num) && num > max ? num : max;
        }, 0);

        const nuevoId = `${categoriaSeleccionada}-${String(ultimoNumero + 1).padStart(2, '0')}`;
        setSugerenciaId(nuevoId);
    }, [categoriaSeleccionada, listaGanado]);

    const abrirModal = () => setIsModalOpen(true);
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => setVista(nuevaVista);

    const guardarAnimal = (nuevoAnimal: any, cerrar: boolean) => {
        console.log("Enviando a base de datos...", nuevoAnimal);
        if (cerrar) {
            cerrarModal();
        } else {
            setVista('lista');
        }
    };

    return {
        listaGanado,
        categoriaSeleccionada,
        setCategoriaSeleccionada,
        sugerenciaId,
        isModalOpen,
        vista,
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarAnimal
    };
};