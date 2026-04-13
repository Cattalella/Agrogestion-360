import { useState, useEffect } from "react";

// ─────────────────────────────────────────
// TIPOS — RF.7.1.1, RF.7.1.2, RF.7.1.4
// ─────────────────────────────────────────

export type TipoSolicitud = 'insumo' | 'alimento' | 'consumo';
export type EstadoSolicitud = 'Pendiente' | 'Aprobada' | 'Rechazada';
export type CategoriaInsumo = 'fertilizante' | 'herramienta' | 'empaque' | 'otro';
export type EspecieDestino = 'cerdos' | 'peces' | 'ganado' | 'gallinas';
export type UnidadMedida = 'kg' | 'litros' | 'sacos' | 'unidades' | 'toneladas';
export type ActividadAsociada = 'siembra' | 'mantenimiento' | 'alimentacion' | 'vacunacion';

export interface SolicitudCompra {
    id: number;
    tipo: TipoSolicitud;
    
    // Campos comunes
    fechaPropuesta: string;
    cantidad: number;
    unidadMedida: UnidadMedida;
    motivo: string;
    estado: EstadoSolicitud;
    
    // Trazabilidad
    fechaCreacion: string;
    horaCreacion: string;
    usuario: string;
    
    // Campos específicos para INSUMO
    tipoInsumo?: string;
    categoriaInsumo?: CategoriaInsumo;
    fechaVencimiento?: string;
    
    // Campos específicos para ALIMENTO
    tipoAlimento?: string;
    especieDestino?: EspecieDestino;
    proveedor?: string;
    categoriaAlimento?: string;
    
    // Campos específicos para CONSUMO
    actividadAsociada?: ActividadAsociada;
    responsableId?: string;
    stockDisponible?: number;
    
    // Control de ejecución
    ejecutada: boolean;
    fechaEjecucion?: string;
    
    // Eliminación registrada
    eliminada: boolean;
    motivoEliminacion?: string;
    
    // Aprobación/Rechazo
    fechaAprobacion?: string;
    aprobadoPor?: string;
    motivoRechazo?: string;
}

type Vista = 'lista' | 'formulario' | 'detalle';

// ─────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────

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

export const validarStock = (solicitud: SolicitudCompra, stockActual: number): boolean => {
    if (solicitud.tipo !== 'consumo') return true;
    return solicitud.cantidad <= stockActual;
};

// ─────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────
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

    const crearSolicitud = (
        datos: Omit<SolicitudCompra, 'id' | 'estado' | 'ejecutada' | 'eliminada' | 'fechaCreacion' | 'horaCreacion' | 'fechaAprobacion' | 'fechaEjecucion'>,
        usuario: string
    ) => {
        const ahora = new Date();
        
        if (datos.tipo === 'consumo') {
            if (!datos.responsableId) {
                alert("❌ Debes seleccionar un responsable para el consumo.");
                return false;
            }
            if (!datos.actividadAsociada) {
                alert("❌ Debes seleccionar una actividad asociada.");
                return false;
            }
        }
        
        const nuevaSolicitud: SolicitudCompra = {
            ...datos,
            id: Date.now(),
            estado: 'Pendiente',
            ejecutada: false,
            eliminada: false,
            fechaCreacion: ahora.toISOString().split('T')[0],
            horaCreacion: ahora.toTimeString().slice(0, 5),
        };
        
        setSolicitudes(prev => [nuevaSolicitud, ...prev]);
        setVista('lista');
        return true;
    };

    const editarSolicitud = (id: number, nuevosDatos: Partial<SolicitudCompra>) => {
        const solicitud = solicitudes.find(s => s.id === id);
        
        if (!solicitud) {
            alert("Solicitud no encontrada");
            return false;
        }
        
        if (solicitud.ejecutada) {
            alert("❌ No se puede editar una solicitud que ya fue ejecutada.");
            return false;
        }
        
        setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, ...nuevosDatos } : s));
        return true;
    };

    const eliminarSolicitud = (id: number, motivo: string) => {
        if (!motivo.trim()) {
            alert("Debes ingresar un motivo para eliminar la solicitud.");
            return false;
        }
        
        setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, eliminada: true, motivoEliminacion: motivo } : s));
        return true;
    };

    const aprobarSolicitud = (id: number, aprobadoPor: string) => {
        const solicitud = solicitudes.find(s => s.id === id);
        
        if (!solicitud) {
            alert("Solicitud no encontrada");
            return false;
        }
        
        if (solicitud.estado !== 'Pendiente') {
            alert("❌ Solo se pueden aprobar solicitudes en estado Pendiente.");
            return false;
        }
        
        setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: 'Aprobada', fechaAprobacion: new Date().toISOString(), aprobadoPor } : s));
        return true;
    };

    const rechazarSolicitud = (id: number, motivo: string, rechazadoPor: string) => {
        if (!motivo.trim()) {
            alert("Debes ingresar un motivo para rechazar la solicitud.");
            return false;
        }
        
        setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: 'Rechazada', fechaAprobacion: new Date().toISOString(), aprobadoPor: rechazadoPor, motivoRechazo: motivo } : s));
        return true;
    };

    const ejecutarSolicitud = (id: number, stockActual?: number) => {
        const solicitud = solicitudes.find(s => s.id === id);
        
        if (!solicitud) {
            alert("Solicitud no encontrada");
            return false;
        }
        
        if (solicitud.estado !== 'Aprobada') {
            alert("❌ Solo puedes ejecutar una solicitud si fue aprobada por el dueño.");
            return false;
        }
        
        if (solicitud.tipo === 'consumo' && stockActual !== undefined) {
            if (!validarStock(solicitud, stockActual)) {
                alert(`❌ Stock insuficiente. Disponible: ${stockActual}, Solicitado: ${solicitud.cantidad}`);
                return false;
            }
        }
        
        setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, ejecutada: true, fechaEjecucion: new Date().toISOString() } : s));
        return true;
    };

    // Listas filtradas
    const solicitudesActivas = solicitudes.filter(s => !s.eliminada);
    const solicitudesPendientes = solicitudesActivas.filter(s => s.estado === 'Pendiente');
    const solicitudesAprobadas = solicitudesActivas.filter(s => s.estado === 'Aprobada');
    const solicitudesRechazadas = solicitudesActivas.filter(s => s.estado === 'Rechazada');
    const solicitudesEjecutadas = solicitudesActivas.filter(s => s.ejecutada);
    const solicitudesInsumo = solicitudesActivas.filter(s => s.tipo === 'insumo');
    const solicitudesAlimento = solicitudesActivas.filter(s => s.tipo === 'alimento');
    const solicitudesConsumo = solicitudesActivas.filter(s => s.tipo === 'consumo');

    return {
        solicitudes,
        solicitudesActivas,
        solicitudesPendientes,
        solicitudesAprobadas,
        solicitudesRechazadas,
        solicitudesEjecutadas,
        solicitudesInsumo,
        solicitudesAlimento,
        solicitudesConsumo,
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
        editarSolicitud,
        eliminarSolicitud,
        aprobarSolicitud,
        rechazarSolicitud,
        ejecutarSolicitud,
    };
};