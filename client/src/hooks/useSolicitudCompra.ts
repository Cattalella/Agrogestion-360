import { useState, useEffect } from "react";

export type TipoSolicitud = 'insumo' | 'alimento';
export type EstadoSolicitud = 'Pendiente' | 'Aprobada' | 'Rechazada';
export type CategoriaInsumo = 'fertilizante' | 'herramienta' | 'empaque' | 'otro';
export type EspecieDestino = 'cerdos' | 'peces' | 'ganado' | 'gallinas';
export type UnidadMedida = 'kg' | 'litros' | 'sacos' | 'unidades' | 'toneladas';

export interface SolicitudCompra {
    id: number;
    tipo: TipoSolicitud;
    fechaPropuesta: string;
    cantidad: number;
    unidadMedida: UnidadMedida;
    motivo: string;
    estado: EstadoSolicitud;
    fechaCreacion: string;
    horaCreacion: string;
    usuario: string;
    tipoInsumo?: string;
    categoriaInsumo?: CategoriaInsumo;
    fechaVencimiento?: string;
    tipoAlimento?: string;
    especieDestino?: EspecieDestino;
    proveedor?: string;
    categoriaAlimento?: string;
    ejecutada: boolean;
    fechaEjecucion?: string;
    eliminada: boolean;
    motivoEliminacion?: string;
    fechaAprobacion?: string;
    aprobadoPor?: string;
    motivoRechazo?: string;
}

type Vista = 'lista' | 'formulario' | 'detalle';

const diasParaVencer = (fechaVencimiento: string): number => {
    const hoy = new Date();
    const vence = new Date(fechaVencimiento);
    const diffMs = vence.getTime() - hoy.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const verificarAlertasVencimiento = (solicitudes: SolicitudCompra[]): SolicitudCompra[] => {
    return solicitudes.filter(s => {
        if (!s.fechaVencimiento || s.eliminada || s.estado !== 'Aprobada') return false;
        const dias = diasParaVencer(s.fechaVencimiento);
        return dias <= 30 && dias >= 0;
    });
};

export const useSolicitudCompra = (inicial: SolicitudCompra[] = []) => {

    const [solicitudes, setSolicitudes] = useState<SolicitudCompra[]>(inicial);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoSolicitud>('insumo');
    const [solicitudAEditar, setSolicitudAEditar] = useState<SolicitudCompra | null>(null);
    const [alertasVencimiento, setAlertasVencimiento] = useState<SolicitudCompra[]>([]);

    useEffect(() => {
        setAlertasVencimiento(verificarAlertasVencimiento(solicitudes));
    }, [solicitudes]);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setSolicitudAEditar(null);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: Vista) => {
        setVista(nuevaVista);
    };

    const crearSolicitud = (datos: any, usuario: string) => {
        const ahora = new Date();
        const nuevaSolicitud: SolicitudCompra = {
            ...datos,
            id: Date.now(),
            estado: 'Pendiente',
            ejecutada: false,
            eliminada: false,
            fechaCreacion: ahora.toISOString().split('T')[0],
            horaCreacion: ahora.toTimeString().slice(0, 5),
            usuario: usuario,
        };
        setSolicitudes(prev => [nuevaSolicitud, ...prev]);
        setVista('lista');
        return true;
    };

    const solicitudesActivas = solicitudes.filter(s => !s.eliminada);
    const solicitudesPendientes = solicitudesActivas.filter(s => s.estado === 'Pendiente');
    const solicitudesAprobadas = solicitudesActivas.filter(s => s.estado === 'Aprobada');
    const solicitudesInsumo = solicitudesActivas.filter(s => s.tipo === 'insumo');
    const solicitudesAlimento = solicitudesActivas.filter(s => s.tipo === 'alimento');

    return {
        solicitudes,
        solicitudesActivas,
        solicitudesPendientes,
        solicitudesAprobadas,
        solicitudesInsumo,
        solicitudesAlimento,
        alertasVencimiento,
        isModalOpen,
        vista,
        tipoSeleccionado,
        solicitudAEditar,
        setVista,
        setTipoSeleccionado,
        setSolicitudAEditar,
        abrirModal,
        cerrarModal,
        cambiarVista,
        crearSolicitud,
    };
};