import { useState, useEffect } from "react";

// ─────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────
export type CategoriaGeneral = 'insumo' | 'alimento';
export type EstadoSolicitud = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface SolicitudCompra {
    id: number;
    categoria_general: CategoriaGeneral;
    fecha_propuesta: string;
    cantidad: number;
    motivo: string;
    fecha_vencimiento?: string;
    estado: EstadoSolicitud;
    ejecutada: boolean;
    fecha_creacion: string;
    hora_creacion: string;
    usuario: string;
    tipo_insumo?: string;
    categoria_insumo?: 'fertilizante' | 'herramienta' | 'empaque' | '';
    tipo_alimento?: string;
    especie_destino?: 'cerdos' | 'peces' | 'ganado' | 'gallinas' | '';
    unidad_medida?: string;
    proveedor?: string;
    categoria_alimento?: string;
    eliminada: boolean;
    motivo_eliminacion?: string;
}

type Vista = 'lista' | 'formulario';

const diasParaVencer = (fechaVencimiento: string): number => {
    const hoy = new Date();
    const vence = new Date(fechaVencimiento);
    const diffMs = vence.getTime() - hoy.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const verificarAlertas = (solicitudes: SolicitudCompra[]): SolicitudCompra[] => {
    return solicitudes.filter(s => {
        if (!s.fecha_vencimiento || s.eliminada) return false;
        const dias = diasParaVencer(s.fecha_vencimiento);
        return dias <= 30 && dias >= 0;
    });
};

export const useRegistrarCompra = (inicial: SolicitudCompra[] = []) => {

    const [listaSolicitudes, setListaSolicitudes] = useState<SolicitudCompra[]>(inicial);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [tipoSeleccionado, setTipoSeleccionado] = useState<CategoriaGeneral>('insumo');
    const [solicitudAEditar, setSolicitudAEditar] = useState<SolicitudCompra | null>(null);
    const [alertasVencimiento, setAlertasVencimiento] = useState<SolicitudCompra[]>([]);

    useEffect(() => {
        setAlertasVencimiento(verificarAlertas(listaSolicitudes));
    }, [listaSolicitudes]);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setSolicitudAEditar(null);
        setVista('lista');
    };

    // ✅ NUEVO: cambiarVista
    const cambiarVista = (nuevaVista: Vista) => {
        setVista(nuevaVista);
    };

    const crearSolicitud = (
        datos: Omit<SolicitudCompra, 'id' | 'estado' | 'ejecutada' | 'eliminada' | 'fecha_creacion' | 'hora_creacion'>
    ) => {
        const ahora = new Date();
        const nueva: SolicitudCompra = {
            ...datos,
            id: Date.now(),
            estado: 'Pendiente',
            ejecutada: false,
            eliminada: false,
            fecha_creacion: ahora.toISOString().split('T')[0],
            hora_creacion: ahora.toTimeString().slice(0, 5),
        };
        setListaSolicitudes(prev => [nueva, ...prev]);
        setVista('lista');
    };

    const ejecutarCompra = (id: number) => {
        const solicitud = listaSolicitudes.find(s => s.id === id);
        if (!solicitud) return;
        if (solicitud.estado !== 'Aprobada') {
            alert("Solo puedes ejecutar una compra si la solicitud fue aprobada por el dueño.");
            return;
        }
        setListaSolicitudes(prev =>
            prev.map(s => s.id === id ? { ...s, ejecutada: true } : s)
        );
    };

    const eliminarSolicitud = (id: number, motivo: string) => {
        if (!motivo.trim()) {
            alert("Debes ingresar un motivo para eliminar la solicitud.");
            return;
        }
        setListaSolicitudes(prev =>
            prev.map(s => s.id === id
                ? { ...s, eliminada: true, motivo_eliminacion: motivo }
                : s
            )
        );
    };

    const cambiarEstado = (id: number, nuevoEstado: EstadoSolicitud) => {
        setListaSolicitudes(prev =>
            prev.map(s => s.id === id ? { ...s, estado: nuevoEstado } : s)
        );
    };

    const solicitudesVisibles = listaSolicitudes.filter(s => !s.eliminada);
    const solicitudesPendientes = solicitudesVisibles.filter(s => s.estado === 'Pendiente');
    const solicitudesAprobadas = solicitudesVisibles.filter(s => s.estado === 'Aprobada');

    return {
        listaSolicitudes,
        solicitudesVisibles,
        solicitudesPendientes,
        solicitudesAprobadas,
        alertasVencimiento,
        isModalOpen,
        vista,
        tipoSeleccionado,
        solicitudAEditar,
        setVista,
        cambiarVista,        // ✅ AGREGADO
        setTipoSeleccionado,
        abrirModal,
        cerrarModal,
        crearSolicitud,
        ejecutarCompra,
        eliminarSolicitud,
        cambiarEstado,
    };
};