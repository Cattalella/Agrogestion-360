import { useState } from 'react';

interface Cerdo {
    id: number;
    local: string;
    oficial: string;
    sexo: string;
    estado: string;
}

export const useCerdos = (listaInicial: Cerdo[]) => {
    // 1. Estados de Datos
    const [listaCerdos, setListaCerdos] = useState<Cerdo[]>(listaInicial);
    const [categoriaCerdo, setCategoriaCerdo] = useState("HEMBRA");
    
    // 2. Estados de UI (Modales y Vistas)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    // 3. Handlers de UI
    const abrirModal = () => setIsModalOpen(true);
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => setVista(nuevaVista);

    // 4. Lógica de Guardado
    const guardarCerdo = (datos: any) => {
        // Aquí conectarás con Prisma en el futuro
        console.log("Guardando cerdo...", datos);
        
        // Simulación de cierre tras guardar
        setIsModalOpen(false);
        setVista('lista');
    };

    // Nota: Si necesitas autogeneración de IDs para cerdos (ej: C-01), 
    // podrías añadir aquí un useEffect similar al de Ganado.

    return {
        listaCerdos,
        categoriaCerdo,
        setCategoriaCerdo,
        isModalOpen,
        vista,
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarCerdo
    };
};