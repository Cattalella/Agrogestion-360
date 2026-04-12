import { useState } from "react";

// ─────────────────────────────────────────
// TIPOS — RI. 8.1.3
// ─────────────────────────────────────────
export type EstadoTrabajador = 'activo' | 'inactivo';

export interface Trabajador {
    id: number;
    id_trabajador: string;
    nombre_completo: string;
    tipo_documento: string;
    numero_documento: string;
    tipo_trabajo: string;
    telefono: string;
    telefono_familiar: string;
    direccion: string;
    estado: EstadoTrabajador;
    fecha_ingreso: string;
    observaciones?: string;
    eliminado: boolean;
    fecha_eliminacion?: string;
}

type Vista = 'lista' | 'formulario';

export const useNuevoTrabajador = (inicial: Trabajador[] = []) => {

    const [trabajadores, setTrabajadores] = useState<Trabajador[]>(inicial);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [trabajadorAEditar, setTrabajadorAEditar] = useState<Trabajador | null>(null);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setTrabajadorAEditar(null);
        setVista('lista');
    };

    // ✅ NUEVO: cambiarVista
    const cambiarVista = (nuevaVista: Vista) => {
        setVista(nuevaVista);
    };

    const guardarTrabajador = (
        datos: Omit<Trabajador, 'id' | 'eliminado'>,
        cerrar: boolean
    ) => {
        if (!datos.id_trabajador || !datos.nombre_completo || !datos.fecha_ingreso) {
            alert("ID, nombre completo y fecha de ingreso son obligatorios.");
            return;
        }
        if (trabajadorAEditar) {
            setTrabajadores(prev =>
                prev.map(t => t.id === trabajadorAEditar.id
                    ? { ...t, ...datos }
                    : t
                )
            );
            setTrabajadorAEditar(null);
        } else {
            const nuevo: Trabajador = {
                ...datos,
                id: Date.now(),
                eliminado: false,
            };
            setTrabajadores(prev => [nuevo, ...prev]);
        }
        if (cerrar) {
            cerrarModal();
        } else {
            setVista('lista');
        }
    };

    const editarTrabajador = (trabajador: Trabajador) => {
        setTrabajadorAEditar(trabajador);
        setVista('formulario');
    };

    const eliminarTrabajador = (id: number) => {
        setTrabajadores(prev =>
            prev.map(t => t.id === id
                ? { ...t, eliminado: true, fecha_eliminacion: new Date().toISOString().split('T')[0] }
                : t
            )
        );
    };

    const trabajadoresActivos = trabajadores.filter(t => !t.eliminado && t.estado === 'activo');
    const trabajadoresVisibles = trabajadores.filter(t => !t.eliminado);

    return {
        trabajadores,
        trabajadoresVisibles,
        trabajadoresActivos,
        isModalOpen,
        vista,
        trabajadorAEditar,
        setVista,
        cambiarVista,      // ✅ AGREGADO
        abrirModal,
        cerrarModal,
        guardarTrabajador,
        editarTrabajador,
        eliminarTrabajador,
    };
};