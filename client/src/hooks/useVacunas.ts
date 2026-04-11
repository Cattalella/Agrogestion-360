import { useState } from 'react';

// Definimos la estructura de la aplicación de vacuna
interface RegistroVacuna {
    id: number;
    animal: string;   // ID Local del animal (VA-01, C-01, etc)
    vacuna: string;   // Nombre de la vacuna
    fecha: string;    // Fecha de aplicación
    refuerzo: string; // Fecha programada de refuerzo
}

export const useVacunas = (listaInicial: RegistroVacuna[]) => {
    // 1. Estados de Datos
    const [listaVacunas, setListaVacunas] = useState<RegistroVacuna[]>(listaInicial);

    // 2. Estados de UI (Modales y Vistas)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    // 3. Handlers de Interfaz
    const abrirModal = () => setIsModalOpen(true);
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => setVista(nuevaVista);

    // 4. Lógica de Negocio: Registro
    const guardarVacuna = (nuevaAplicacion: any) => {
        // En el futuro: await prisma.vacuna.create({ data: nuevaAplicacion })
        console.log("Registrando aplicación de vacuna...", nuevaAplicacion);
        
        // Simulación: Volver a la lista tras guardar
        setVista('lista');
    };

    return {
        listaVacunas,
        isModalOpen,
        vista,
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarVacuna
    };
};