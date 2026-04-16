import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ============================================================
// 📌 TIPOS
// ============================================================
export type TipoSolicitud = 'insumo' | 'alimento';
export type EstadoSolicitud = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Completada';
export type CategoriaInsumo = 'fertilizante' | 'herramienta' | 'empaque' | 'otro';
export type EspecieDestino = 'cerdos' | 'peces' | 'ganado' | 'gallinas';
export type UnidadMedida = 'kg' | 'litros' | 'sacos' | 'unidades' | 'toneladas';

export interface SolicitudCompra {
    id_solicitud: number;
    tipo: TipoSolicitud;
    fecha_compra: string;
    cantidad: number;
    unidad_medida: UnidadMedida;
    motivo: string;
    estado_sol: EstadoSolicitud;
    createdAt: string;
    usuario?: string;
    tipoInsumo?: string;
    categoriaInsumo?: CategoriaInsumo;
    fechaVencimiento?: string;
    tipoAlimento?: string;
    especieDestino?: EspecieDestino;
    proveedor?: string;
    categoriaAlimento?: string;
}

type Vista = 'lista' | 'formulario' | 'detalle';

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useSolicitudCompra = () => {
    const [solicitudes, setSolicitudes] = useState<SolicitudCompra[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoSolicitud>('insumo');
    const [solicitudAEditar, setSolicitudAEditar] = useState<SolicitudCompra | null>(null);
    const [cargando, setCargando] = useState(false);

    // ============================================================
    // CARGAR SOLICITUDES
    // ============================================================
    const cargarSolicitudes = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/inventario/solicitudes');
            setSolicitudes(respuesta.data);
            console.log('✅ Solicitudes cargadas:', respuesta.data.length);
        } catch (error) {
            console.error("❌ Error al cargar solicitudes:", error);
        } finally {
            setCargando(false);
        }
    };

    // Cargar al iniciar
    useEffect(() => {
        cargarSolicitudes();
    }, []);

    // Refrescar al abrir modal
    useEffect(() => {
        if (isModalOpen) {
            cargarSolicitudes();
        }
    }, [isModalOpen]);

    // ============================================================
    // ABRIR / CERRAR MODAL
    // ============================================================
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

    const cambiarVista = (nuevaVista: Vista) => setVista(nuevaVista);

    // ============================================================
    // CREAR SOLICITUD (CON PARÁMETRO cerrar)
    // ============================================================
    const crearSolicitud = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const payload = {
                categoria_general: datos.tipo || tipoSeleccionado,
                nombre_insumo: datos.tipo === 'insumo' ? datos.tipoInsumo : datos.tipoAlimento,
                unidad_medida: datos.unidadMedida,
                categoria: datos.tipo === 'insumo' ? datos.categoriaInsumo : 'alimento',
                especie_destino: datos.especieDestino,
                cantidad: datos.cantidad,
                fecha_compra_propuesta: datos.fechaPropuesta || datos.fecha_compra,
                fecha_vencimiento: datos.fechaVencimiento || null,
                motivo: datos.motivo,
                proveedor: datos.proveedor || null,
                usuario: datos.usuario || 'Admin'
            };

            console.log('📤 Enviando a backend (Solicitud Compra):', payload);
            
            await apiClient.post('/inventario/solicitudes', payload);
            
            await cargarSolicitudes();
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
                setSolicitudAEditar(null);
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

    // ============================================================
    // PROCESAR SOLICITUD (APROBAR/RECHAZAR)
    // ============================================================
    const procesarSolicitud = async (id: number, estado: EstadoSolicitud, observaciones?: string) => {
        try {
            await apiClient.patch(`/inventario/solicitudes/${id}/procesar`, { 
                estado, 
                observaciones 
            });
            await cargarSolicitudes();
            return true;
        } catch (error) {
            console.error("❌ Error al procesar solicitud:", error);
            return false;
        }
    };

    // ============================================================
    // 🆕 ACTUALIZAR SOLICITUD
    // ============================================================
    const actualizarSolicitud = async (id: number, datos: Partial<SolicitudCompra>) => {
        try {
            const respuesta = await apiClient.put(`/inventario/solicitudes/${id}`, datos);
            setSolicitudes(prev => prev.map(s => 
                s.id_solicitud === id ? { ...s, ...datos } : s
            ));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar solicitud:', error);
        }
    };

    // ============================================================
    // 🆕 ELIMINAR SOLICITUD
    // ============================================================
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
            console.error('❌ Error al eliminar solicitud:', error);
            return false;
        }
    };

    // ============================================================
    // FILTROS
    // ============================================================
    const solicitudesPendientes = solicitudes.filter(s => s.estado_sol === 'Pendiente');
    const solicitudesAprobadas = solicitudes.filter(s => s.estado_sol === 'Aprobada');

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        solicitudes,
        listaSolicitudes: solicitudes,
        solicitudesPendientes,
        solicitudesAprobadas,
        isModalOpen,
        vista,
        tipoSeleccionado,
        solicitudAEditar,
        cargando,
        loading: cargando,
        
        setVista,
        setTipoSeleccionado,
        setSolicitudAEditar,
        
        abrirModal,
        cerrarModal,
        cambiarVista,
        
        crearSolicitud,
        guardarSolicitud: crearSolicitud,  // Alias para compatibilidad
        procesarSolicitud,
        cambiarEstadoSolicitud: procesarSolicitud,
        actualizarSolicitud,
        eliminarSolicitud,
        recargarLista: cargarSolicitudes,
    };
};