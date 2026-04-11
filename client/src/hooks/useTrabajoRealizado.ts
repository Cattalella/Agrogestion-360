import { useState } from "react";

export const useTrabajoRealizado = (initialData: any[] = []) => {
    const [listaTrabajos, setListaTrabajos] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');

    const abrirModal = () => setIsModalOpen(true);
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    // Función para calcular duración automáticamente (RN. 8.1.2)
    const calcularDuracion = (inicio: string, fin: string) => {
        if (!inicio || !fin) return "0 horas";
        const fechaIn = new Date(inicio);
        const fechaFi = new Date(fin);
        const diferenciaMs = fechaFi.getTime() - fechaIn.getTime();
        
        if (diferenciaMs < 0) return "Error en fechas";
        
        const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
        const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${horas}h ${minutos}m`;
    };

    const guardarTrabajo = (nuevoTrabajo: any) => {
        // Validación de evidencia fotográfica (RN. 8.1.2)
        if (!nuevoTrabajo.evidenciaFotografica) {
            alert("La evidencia fotográfica es obligatoria");
            return;
        }

        const registro = {
            ...nuevoTrabajo,
            id: Date.now(),
            duracion_trabajo: calcularDuracion(nuevoTrabajo.fecha_inicio, nuevoTrabajo.fecha_fin),
            fecha_registro: new Date().toISOString()
        };

        setListaTrabajos([registro, ...listaTrabajos]);
        setVista('lista');
    };

    const eliminarTrabajo = (id: number, justificacion: string) => {
        // RN. 8.1.2: La eliminación debe estar justificada
        if (!justificacion) return;
        
        setListaTrabajos(prev => prev.filter(t => t.id !== id));
        console.log(`Trabajo ${id} eliminado. Razón: ${justificacion}`);
    };

    return {
        listaTrabajos,
        isModalOpen,
        vista,
        abrirModal,
        cerrarModal,
        setVista,
        guardarTrabajo,
        eliminarTrabajo
    };
};