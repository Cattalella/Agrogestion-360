import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ============================================================
// 📌 TIPOS
// ============================================================
export type CategoriaGeneral = 'insumo' | 'alimento';
export type EstadoSolicitud = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface SolicitudCompra {
    id: number;
    id_solicitud: number;
    categoria_general: CategoriaGeneral;
    fecha_propuesta: string;
    cantidad: number;
    motivo: string;
    fecha_vencimiento?: string;
    estado_sol: EstadoSolicitud;
    ejecutada: boolean;
    fecha_creacion: string;
    fecha_compra?: string;
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
    precio_total?: number;
    precio_unitario?: number;   // ✅ AGREGADO
}

export interface ComprasStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
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

export const useRegistrarCompra = () => {

    const [listaSolicitudes, setListaSolicitudes] = useState<SolicitudCompra[]>([]);
    const [cargando, setCargando] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [tipoSeleccionado, setTipoSeleccionado] = useState<CategoriaGeneral>('insumo');
    const [solicitudAEditar, setSolicitudAEditar] = useState<SolicitudCompra | null>(null);
    const [alertasVencimiento, setAlertasVencimiento] = useState<SolicitudCompra[]>([]);

    const cargarSolicitudes = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/inventario/solicitudes');
            console.log('📋 Solicitudes cargadas:', respuesta.data);
            setListaSolicitudes(respuesta.data);
        } catch (error) {
            console.error("❌ Error al cargar solicitudes:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    useEffect(() => {
        setAlertasVencimiento(verificarAlertas(listaSolicitudes));
    }, [listaSolicitudes]);

    const calcularStats = (): ComprasStats => {
        const solicitudesVisibles = listaSolicitudes.filter(s => !s.eliminada);
        
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        
        const totalGastadoMes = solicitudesVisibles
            .filter(s => {
                const fecha = new Date(s.fecha_creacion);
                const esAprobada = s.estado_sol === 'Aprobada';
                return fecha >= inicioMes && esAprobada;
            })
            .reduce((sum, s) => sum + (Number(s.precio_total) || 0), 0);

        const pendientes = solicitudesVisibles.filter(s => 
            s.estado_sol === 'Pendiente'
        ).length;

        return {
            tipo1: "TOTAL",
            cantidad1: totalGastadoMes,
            tipo2: "PENDIENTES",
            cantidad2: pendientes
        };
    };

    const abrirModal = () => {
        setVista('lista');
        setSolicitudAEditar(null);
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

    const crearSolicitud = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                categoria_general: datos.tipo || datos.categoria_general,
                fecha_compra_propuesta: datos.fechaPropuesta,
                cantidad: datos.cantidad,
                motivo: datos.motivo,
                fecha_vencimiento: datos.fechaVencimiento || null,
                proveedor: datos.proveedor || null,
                tipo_insumo: datos.tipoInsumo || null,
                categoria_insumo: datos.categoriaInsumo || null,
                tipo_alimento: datos.tipoAlimento || null,
                especie_destino: datos.especieDestino || null,
                unidad_medida: datos.unidadMedida || 'kg',
                usuario: datos.usuario || "Admin",
                precio_total: datos.precio_total || 0,
                precio_unitario: datos.precio_unitario || 0,
            };

            console.log('📤 Enviando a backend:', datosParaBackend);
            
            await apiClient.post('/inventario/solicitudes', datosParaBackend);
            
            await cargarSolicitudes();
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error: any) {
            console.error("❌ Error al crear solicitud:", error);
            alert(error.response?.data?.mensaje || "Error al crear solicitud");
            return false;
        } finally {
            setCargando(false);
        }
    };

    const ejecutarCompraReal = async (datosCompra: any) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                id_solicitud: datosCompra.id_solicitud,
                fecha_compra_real: datosCompra.fecha_compra_real,
                numero_lote: datosCompra.numero_lote,
                cantidad_real: datosCompra.cantidad_real,
                precio_unitario: datosCompra.precio_unitario,
                precio_total: datosCompra.precio_total,
                factura: datosCompra.factura,
                fecha_vencimiento: datosCompra.fecha_vencimiento,
                proveedor_real: datosCompra.proveedor_real,
                observaciones: datosCompra.observaciones,
                tipo: datosCompra.tipo,
                nombre_producto: datosCompra.nombre_producto,
                unidad_medida: datosCompra.unidad_medida,
            };

            console.log('📦 Ejecutando compra real:', datosParaBackend);
            
            const response = await apiClient.post('/inventario/compras/ejecutar', datosParaBackend);
            
            await cargarSolicitudes();
            
            return response.data;
        } catch (error: any) {
            console.error("❌ Error al ejecutar compra real:", error);
            alert(error.response?.data?.mensaje || "Error al registrar la compra");
            throw error;
        } finally {
            setCargando(false);
        }
    };

    const ejecutarCompra = async (id: number) => {
        const solicitud = listaSolicitudes.find(s => s.id === id);
        if (!solicitud) return false;
        
        if (solicitud.estado_sol !== 'Aprobada') {
            alert("Solo puedes ejecutar una compra si la solicitud fue aprobada por el dueño.");
            return false;
        }
        
        if (solicitud.ejecutada) {
            alert("Esta compra ya fue registrada. No se puede duplicar.");
            return false;
        }
        
        try {
            await apiClient.patch(`/inventario/solicitudes/${id}/ejecutar`);
            await cargarSolicitudes();
            return true;
        } catch (error) {
            console.error("❌ Error al ejecutar compra:", error);
            return false;
        }
    };

    const eliminarSolicitud = async (id: number, motivo: string) => {
        if (!motivo.trim()) {
            alert("Debes ingresar un motivo para eliminar la solicitud.");
            return false;
        }
        
        try {
            await apiClient.delete(`/inventario/solicitudes/${id}`, {
                data: { motivo_eliminacion: motivo }
            });
            await cargarSolicitudes();
            return true;
        } catch (error) {
            console.error("❌ Error al eliminar solicitud:", error);
            return false;
        }
    };

    const cambiarEstado = async (id: number, nuevoEstado: EstadoSolicitud) => {
        try {
            await apiClient.patch(`/inventario/solicitudes/${id}/estado`, {
                estado: nuevoEstado
            });
            
            setListaSolicitudes(prev =>
                prev.map(s => s.id === id ? { ...s, estado_sol: nuevoEstado } : s)
            );
            return true;
        } catch (error) {
            console.error("❌ Error al cambiar estado:", error);
            return false;
        }
    };

    const solicitudesVisibles = listaSolicitudes.filter(s => !s.eliminada);
    const solicitudesPendientes = solicitudesVisibles.filter(s => s.estado_sol === 'Pendiente');
    const solicitudesAprobadas = solicitudesVisibles.filter(s => s.estado_sol === 'Aprobada' && !s.ejecutada);

    return {
        listaSolicitudes,
        solicitudesVisibles,
        solicitudesPendientes,
        solicitudesAprobadas,
        alertasVencimiento,
        cargando,
        loading: cargando,
        isModalOpen,
        vista,
        tipoSeleccionado,
        solicitudAEditar,
        setSolicitudAEditar,
        setVista,
        cambiarVista,
        setTipoSeleccionado,
        
        stats: calcularStats(),
        
        abrirModal,
        cerrarModal,
        crearSolicitud,
        guardarCompra: crearSolicitud,
        ejecutarCompra,
        ejecutarCompraReal,
        eliminarSolicitud,
        cambiarEstado,
        recargarLista: cargarSolicitudes,
    };
};