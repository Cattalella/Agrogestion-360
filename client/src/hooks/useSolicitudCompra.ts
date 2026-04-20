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

interface ModalConfirmacionState {
    isOpen: boolean;
    id: number | null;
    nombre: string;
}

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
    const [bannerVisible, setBannerVisible] = useState(true);
    
    // 🆕 Estado para modal de confirmación
    const [modalConfirmacion, setModalConfirmacion] = useState<ModalConfirmacionState>({
        isOpen: false,
        id: null,
        nombre: ''
    });
    const [eliminando, setEliminando] = useState(false);

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

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            cargarSolicitudes();
            setBannerVisible(true);
        }
    }, [isModalOpen]);

    const abrirModal = () => {
        setVista('lista');
        setSolicitudAEditar(null);
        setBannerVisible(true);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setSolicitudAEditar(null);
        setVista('lista');
        setBannerVisible(true);
    };

    const cambiarVista = (nuevaVista: Vista) => setVista(nuevaVista);
    const cerrarBanner = () => setBannerVisible(false);

    // 🆕 Abrir modal de confirmación para eliminar
    const abrirModalEliminar = (id: number, nombre: string) => {
        setModalConfirmacion({
            isOpen: true,
            id: id,
            nombre: nombre
        });
    };

    const cerrarModalConfirmacion = () => {
        setModalConfirmacion({
            isOpen: false,
            id: null,
            nombre: ''
        });
        setEliminando(false);
    };

    const confirmarEliminar = async () => {
        if (!modalConfirmacion.id) return;
        
        setEliminando(true);
        try {
            await apiClient.delete(`/inventario/solicitudes/${modalConfirmacion.id}`, {
                data: { motivo_eliminacion: `Eliminada por usuario - ${new Date().toLocaleString()}` }
            });
            await cargarSolicitudes();
            setBannerVisible(true);
            cerrarModalConfirmacion();
            console.log('✅ Solicitud eliminada');
        } catch (error) {
            console.error('❌ Error al eliminar solicitud:', error);
            alert('Error al eliminar la solicitud');
        } finally {
            setEliminando(false);
        }
    };

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

            console.log('📤 Creando nueva solicitud:', payload);
            
            await apiClient.post('/inventario/solicitudes', payload);
            
            await cargarSolicitudes();
            setBannerVisible(true);
            
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

    const actualizarSolicitud = async (id: number, datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const payload = {
                cantidad: datos.cantidad,
                motivo: datos.motivo,
                fecha_compra: datos.fechaPropuesta || datos.fecha_compra,
                proveedor: datos.proveedor || null,
                nombre_insumo: datos.tipo === 'insumo' ? datos.tipoInsumo : datos.tipoAlimento,
                unidad_medida: datos.unidadMedida,
                categoria: datos.tipo === 'insumo' ? datos.categoriaInsumo : 'alimento',
                especie_destino: datos.especieDestino
            };

            console.log('✏️ Editando solicitud:', id, payload);
            
            await apiClient.put(`/inventario/solicitudes/${id}`, payload);
            
            await cargarSolicitudes();
            setSolicitudAEditar(null);
            setBannerVisible(true);
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error: any) {
            console.error("❌ Error al actualizar solicitud:", error);
            alert(error.response?.data?.mensaje || "Error al actualizar solicitud");
            return false;
        } finally {
            setCargando(false);
        }
    };

    const solicitudesPendientes = solicitudes.filter(s => s.estado_sol === 'Pendiente');
    const solicitudesAprobadas = solicitudes.filter(s => s.estado_sol === 'Aprobada');
    const solicitudesRechazadas = solicitudes.filter(s => s.estado_sol === 'Rechazada');

    return {
        solicitudes,
        listaSolicitudes: solicitudes,
        solicitudesPendientes,
        solicitudesAprobadas,
        solicitudesRechazadas,
        isModalOpen,
        vista,
        tipoSeleccionado,
        solicitudAEditar,
        cargando,
        loading: cargando,
        bannerVisible,
        
        // 🆕 Modal de confirmación
        modalConfirmacion,
        eliminando,
        abrirModalEliminar,
        cerrarModalConfirmacion,
        confirmarEliminar,
        
        setVista,
        setTipoSeleccionado,
        setSolicitudAEditar,
        
        abrirModal,
        cerrarModal,
        cambiarVista,
        cerrarBanner,
        
        crearSolicitud,
        actualizarSolicitud,
        recargarLista: cargarSolicitudes,
    };
};