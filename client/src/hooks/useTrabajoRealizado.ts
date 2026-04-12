import { useState } from "react";

// ─────────────────────────────────────────
// TIPOS — RI. 8.1.2
// ─────────────────────────────────────────
export interface TrabajoRealizado {
    id: number;
    id_mantenimiento: string;
    id_trabajador: string;
    categoria_trabajo: string;
    tipo_actividad: string;
    fecha_inicio: string;
    fecha_fin: string;
    duracion_trabajo: string;
    evidencia_fotografica: string;
    observaciones: string;
    eliminado: boolean;
    justificacion_eliminacion?: string;
}

type Vista = 'lista' | 'formulario';

const calcularDuracion = (fechaInicio: string, fechaFin: string): string => {
    if (!fechaInicio || !fechaFin) return "—";
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffMs = fin.getTime() - inicio.getTime();
    if (diffMs < 0) return "Fecha inválida";
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (dias === 0) return `${horas}h`;
    if (horas === 0) return `${dias}d`;
    return `${dias}d ${horas}h`;
};

export const useTrabajoRealizado = (inicial: TrabajoRealizado[] = []) => {

    const [listaTrabajos, setListaTrabajos] = useState<TrabajoRealizado[]>(inicial);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [trabajoAEditar, setTrabajoAEditar] = useState<TrabajoRealizado | null>(null);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setTrabajoAEditar(null);
        setVista('lista');
    };

    // ✅ NUEVO: cambiarVista
    const cambiarVista = (nuevaVista: Vista) => {
        setVista(nuevaVista);
    };

    const guardarTrabajo = (
        datos: Omit<TrabajoRealizado, 'id' | 'duracion_trabajo' | 'eliminado'>,
        cerrar: boolean
    ) => {
        if (!datos.evidencia_fotografica) {
            alert("La evidencia fotográfica es obligatoria.");
            return;
        }
        const duracion_trabajo = calcularDuracion(datos.fecha_inicio, datos.fecha_fin);
        if (trabajoAEditar) {
            setListaTrabajos(prev =>
                prev.map(t => t.id === trabajoAEditar.id
                    ? { ...t, ...datos, duracion_trabajo }
                    : t
                )
            );
            setTrabajoAEditar(null);
        } else {
            const nuevo: TrabajoRealizado = {
                ...datos,
                id: Date.now(),
                duracion_trabajo,
                eliminado: false,
            };
            setListaTrabajos(prev => [nuevo, ...prev]);
        }
        if (cerrar) {
            cerrarModal();
        } else {
            setVista('lista');
        }
    };

    const editarTrabajo = (trabajo: TrabajoRealizado) => {
        setTrabajoAEditar(trabajo);
        setVista('formulario');
    };

    const eliminarTrabajo = (id: number, justificacion: string) => {
        if (!justificacion.trim()) {
            alert("Debes ingresar una justificación para eliminar el registro.");
            return;
        }
        setListaTrabajos(prev =>
            prev.map(t => t.id === id
                ? { ...t, eliminado: true, justificacion_eliminacion: justificacion }
                : t
            )
        );
    };

    const filtrarTrabajadoresActivos = (trabajadores: any[]) => {
        return trabajadores.filter(t => t.estado === 'activo');
    };

    const trabajosActivos = listaTrabajos.filter(t => !t.eliminado);
    const trabajosEliminados = listaTrabajos.filter(t => t.eliminado);

    return {
        listaTrabajos,
        trabajosActivos,
        trabajosEliminados,
        isModalOpen,
        vista,
        trabajoAEditar,
        setVista,
        cambiarVista,      // ✅ AGREGADO
        abrirModal,
        cerrarModal,
        guardarTrabajo,
        editarTrabajo,
        eliminarTrabajo,
        filtrarTrabajadoresActivos,
        calcularDuracion,
    };
};